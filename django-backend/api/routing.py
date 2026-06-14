"""
WebSocket URL routing.
"""
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/research/(?P<task_id>[0-9a-f-]+)/$', consumers.ResearchConsumer.as_asgi()),
]
