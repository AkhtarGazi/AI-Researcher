"""
Service layer that wraps the research-agent pipeline.
Handles executing the pipeline, updating models, and sending WebSocket notifications.
"""
import logging
import time
import re
import json
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

logger = logging.getLogger('api')


def send_ws_event(task_id: str, event_type: str, data: dict = None):
    """Send a WebSocket event to the task's channel group."""
    try:
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f"research_{task_id}",
                {
                    "type": "research_event",
                    "event": event_type,
                    "data": data or {},
                }
            )
    except Exception as e:
        logger.warning(f"WebSocket send failed: {e}")


def update_step(task, step_name: str, status: str, result=None):
    """Update a research step's status and optionally store result."""
    from .models import ResearchStep
    step, _ = ResearchStep.objects.get_or_create(
        task=task, step_name=step_name
    )
    step.status = status
    if result is not None:
        step.result = result
    step.save()
    return step


def extract_score_from_critique(critique_text: str) -> dict:
    """Parse the critic's output to extract a numeric score and summary."""
    score = None
    # Try to find patterns like "8/10", "Score: 8", "score out of 10: 8"
    patterns = [
        r'(\d+(?:\.\d+)?)\s*/\s*10',
        r'[Ss]core[:\s]+(\d+(?:\.\d+)?)',
        r'(\d+(?:\.\d+)?)\s+out\s+of\s+10',
    ]
    for pattern in patterns:
        match = re.search(pattern, critique_text)
        if match:
            try:
                score = float(match.group(1))
                if score > 10:
                    score = None
                break
            except ValueError:
                pass

    return {
        "score": score,
        "text": critique_text,
    }


def parse_report_sections(report_text: str) -> dict:
    """Parse the writer's output into structured sections."""
    sections = {
        "full_text": report_text,
        "introduction": "",
        "findings": "",
        "conclusion": "",
        "sources": "",
    }

    # Try to split by common markdown headings
    lower = report_text.lower()

    # Find introduction
    intro_markers = ['## introduction', '# introduction', '**introduction**']
    findings_markers = ['## key findings', '# key findings', '**key findings**',
                        '## findings', '# findings', '**findings**']
    conclusion_markers = ['## conclusion', '# conclusion', '**conclusion**']
    sources_markers = ['## sources', '# sources', '**sources**', '## references', '# references']

    def find_section(text, start_markers, end_markers_list):
        text_lower = text.lower()
        start_pos = -1
        for marker in start_markers:
            pos = text_lower.find(marker)
            if pos != -1:
                start_pos = pos + len(marker)
                break
        if start_pos == -1:
            return ""

        end_pos = len(text)
        for end_markers in end_markers_list:
            for marker in end_markers:
                pos = text_lower.find(marker, start_pos)
                if pos != -1 and pos < end_pos:
                    end_pos = pos
        return text[start_pos:end_pos].strip()

    sections["introduction"] = find_section(
        report_text, intro_markers, [findings_markers, conclusion_markers, sources_markers]
    )
    sections["findings"] = find_section(
        report_text, findings_markers, [conclusion_markers, sources_markers]
    )
    sections["conclusion"] = find_section(
        report_text, conclusion_markers, [sources_markers]
    )
    sections["sources"] = find_section(
        report_text, sources_markers, [[]]
    )

    return sections


def execute_research(task_id: str):
    """
    Execute the full research pipeline for a given task.
    This runs in a background thread and updates the database + WebSocket as it progresses.
    """
    from .models import ResearchTask

    try:
        task = ResearchTask.objects.get(id=task_id)
    except ResearchTask.DoesNotExist:
        logger.error(f"Task {task_id} not found")
        return

    # Check if cancelled before starting
    if task.status == 'cancelled':
        return

    task.status = 'running'
    task.save()

    start_time = time.time()
    task_id_str = str(task_id)

    send_ws_event(task_id_str, "research_started", {"topic": task.topic})

    try:
        # Initialize all steps as pending
        for step_name in ['search', 'scrape', 'write', 'critique']:
            update_step(task, step_name, 'pending')

        # ── Step 1: Search ──
        update_step(task, 'search', 'running')
        send_ws_event(task_id_str, "step_update", {
            "step": "search", "status": "running",
            "message": "Searching the web for information..."
        })

        from agents.agents import build_search_agent, build_reader_agent, writer_chain, critic_chain

        search_agent = build_search_agent()
        search_results = search_agent.invoke({
            "messages": [{"role": "human", "content": f"Search for information on the topic: {task.topic}"}]
        })
        search_content = (
            search_results['messages'][-1].content
            if search_results.get('messages')
            else "No search results found."
        )

        # Check if cancelled
        task.refresh_from_db()
        if task.status == 'cancelled':
            return

        task.search_results = {"content": search_content}
        task.save()
        update_step(task, 'search', 'completed', {"content": search_content[:500]})
        send_ws_event(task_id_str, "search_completed", {
            "step": "search", "status": "completed",
            "message": "Web search completed successfully"
        })

        # ── Step 2: Scrape ──
        update_step(task, 'scrape', 'running')
        send_ws_event(task_id_str, "step_update", {
            "step": "scrape", "status": "running",
            "message": "Extracting content from sources..."
        })

        reader_agent = build_reader_agent()
        reader_result = reader_agent.invoke({
            "messages": [("user",
                f"Based on the following search results about '{task.topic}', "
                f"pick the most relevant URL and scrape it for deeper content.\n\n"
                f"Search Results:\n{search_content[:800]}"
            )]
        })
        scraped_content = (
            reader_result['messages'][-1].content
            if reader_result.get('messages')
            else "No content scraped."
        )

        task.refresh_from_db()
        if task.status == 'cancelled':
            return

        task.scraped_content = {"content": scraped_content}
        task.save()
        update_step(task, 'scrape', 'completed', {"content": scraped_content[:500]})
        send_ws_event(task_id_str, "scraping_completed", {
            "step": "scrape", "status": "completed",
            "message": "Content extraction completed"
        })

        # ── Step 3: Write ──
        update_step(task, 'write', 'running')
        send_ws_event(task_id_str, "step_update", {
            "step": "write", "status": "running",
            "message": "Generating research report..."
        })

        research_combined = (
            f"Search results:\n{search_content}\n\n"
            f"Detailed scraped content:\n{scraped_content}"
        )
        report_result = writer_chain.invoke({
            "topic": task.topic,
            "research": research_combined,
        })
        report_text = report_result.content if hasattr(report_result, 'content') else str(report_result)

        task.refresh_from_db()
        if task.status == 'cancelled':
            return

        parsed_report = parse_report_sections(report_text)
        task.report = parsed_report
        task.save()
        update_step(task, 'write', 'completed')
        send_ws_event(task_id_str, "report_generated", {
            "step": "write", "status": "completed",
            "message": "Research report generated"
        })

        # ── Step 4: Critique ──
        update_step(task, 'critique', 'running')
        send_ws_event(task_id_str, "step_update", {
            "step": "critique", "status": "running",
            "message": "Evaluating report quality..."
        })

        critique_result = critic_chain.invoke({"report": report_result})
        critique_text = critique_result.content if hasattr(critique_result, 'content') else str(critique_result)

        parsed_critique = extract_score_from_critique(critique_text)
        task.critique = parsed_critique
        task.status = 'completed'
        task.duration_seconds = round(time.time() - start_time, 2)
        task.save()
        update_step(task, 'critique', 'completed', {"score": parsed_critique.get("score")})

        send_ws_event(task_id_str, "critique_completed", {
            "step": "critique", "status": "completed",
            "message": "Quality review completed",
            "score": parsed_critique.get("score"),
        })
        send_ws_event(task_id_str, "research_completed", {
            "status": "completed",
            "duration": task.duration_seconds,
            "message": "Research completed successfully!",
        })

        logger.info(f"Research completed for task {task_id} in {task.duration_seconds}s")

    except Exception as e:
        logger.exception(f"Research pipeline failed for task {task_id}")
        task.refresh_from_db()
        task.status = 'failed'
        task.error_message = str(e)
        task.duration_seconds = round(time.time() - start_time, 2)
        task.save()

        # Update the currently running step as failed
        from .models import ResearchStep
        ResearchStep.objects.filter(task=task, status='running').update(status='failed')

        send_ws_event(task_id_str, "research_failed", {
            "status": "failed",
            "message": f"Research failed: {str(e)[:200]}",
            "error": str(e)[:500],
        })
