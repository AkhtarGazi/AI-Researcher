"""
API URL routing.
"""
from django.urls import path
from . import views

urlpatterns = [
    # Research endpoints
    path('research/', views.create_research, name='create-research'),
    path('research/history/', views.research_history, name='research-history'),
    path('research/<uuid:task_id>/', views.get_research, name='get-research'),
    path('research/<uuid:task_id>/cancel/', views.cancel_research, name='cancel-research'),
    path('research/<uuid:task_id>/delete/', views.delete_research, name='delete-research'),

    # Health check
    path('health/', views.health_check, name='health-check'),
]
