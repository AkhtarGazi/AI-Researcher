"""
REST API views for research tasks.
"""
import logging
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import ResearchTask
from .serializers import (
    ResearchTaskSerializer,
    ResearchTaskListSerializer,
    ResearchCreateSerializer,
)
from .tasks import run_research_task

logger = logging.getLogger('api')


def success_response(data, status_code=200):
    """Standard success response wrapper."""
    return Response({
        "success": True,
        "data": data,
        "error": None,
    }, status=status_code)


def error_response(message, code="ERROR", details=None, status_code=400):
    """Standard error response wrapper."""
    return Response({
        "success": False,
        "data": None,
        "error": {
            "code": code,
            "message": message,
            "details": details,
        }
    }, status=status_code)


@api_view(['POST'])
def create_research(request):
    """
    POST /api/research/
    Initiate a new research task.
    """
    serializer = ResearchCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response(
            "Invalid input",
            code="VALIDATION_ERROR",
            details=serializer.errors,
            status_code=400,
        )

    topic = serializer.validated_data['topic']

    # Create the task in DB
    task = ResearchTask.objects.create(topic=topic, status='queued')
    logger.info(f"Created research task {task.id} for topic: {topic}")

    # Start background processing
    run_research_task(str(task.id))

    return success_response({
        "task_id": str(task.id),
        "topic": task.topic,
        "status": task.status,
    }, status_code=201)


@api_view(['GET'])
def get_research(request, task_id):
    """
    GET /api/research/<task_id>/
    Get research task status and results.
    """
    task = get_object_or_404(ResearchTask, id=task_id)
    serializer = ResearchTaskSerializer(task)
    return success_response(serializer.data)


@api_view(['POST'])
def cancel_research(request, task_id):
    """
    POST /api/research/<task_id>/cancel/
    Cancel a running research task.
    """
    task = get_object_or_404(ResearchTask, id=task_id)

    if task.status == 'cancelled':
        return success_response({"task_id": str(task.id), "status": "cancelled", "message": "Already cancelled"})

    if task.status in ('completed', 'failed'):
        return success_response({
            "task_id": str(task.id),
            "status": task.status,
            "message": f"Task already reached terminal state: {task.status}"
        })

    task.status = 'cancelled'
    task.save()
    logger.info(f"Cancelled research task {task_id}")

    return success_response({
        "task_id": str(task.id),
        "status": "cancelled",
    })


@api_view(['GET'])
def research_history(request):
    """
    GET /api/research/history/
    Get all past research tasks.
    """
    tasks = ResearchTask.objects.all()

    # Optional filters
    topic_filter = request.query_params.get('topic')
    status_filter = request.query_params.get('status')
    min_score = request.query_params.get('min_score')

    if topic_filter:
        tasks = tasks.filter(topic__icontains=topic_filter)
    if status_filter:
        tasks = tasks.filter(status=status_filter)

    serializer = ResearchTaskListSerializer(tasks, many=True)
    return success_response(serializer.data)


@api_view(['DELETE'])
def delete_research(request, task_id):
    """
    DELETE /api/research/<task_id>/
    Delete a research task.
    """
    task = get_object_or_404(ResearchTask, id=task_id)
    task.delete()
    logger.info(f"Deleted research task {task_id}")
    return success_response({"deleted": True})


@api_view(['GET'])
def health_check(request):
    """
    GET /api/health/
    API health check endpoint.
    """
    import os
    return success_response({
        "status": "healthy",
        "version": "1.0.0",
        "keys_configured": {
            "tavily": bool(os.getenv('TAVILY_API_KEY')),
            "mistral": bool(os.getenv('MISTRAL_API_KEY')),
        }
    })
