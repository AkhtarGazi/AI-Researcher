"""
Background task execution using threading.
"""
import threading
import logging

logger = logging.getLogger('api')


def run_research_task(task_id: str):
    """Start the research pipeline in a background thread."""
    from .services import execute_research

    def _worker():
        try:
            execute_research(task_id)
        except Exception as e:
            logger.exception(f"Background task failed for {task_id}: {e}")

    thread = threading.Thread(target=_worker, daemon=True)
    thread.start()
    logger.info(f"Started background research thread for task {task_id}")
    return thread
