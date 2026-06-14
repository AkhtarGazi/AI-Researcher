"""
ASGI config for research_api project.
Routes HTTP and WebSocket connections.
"""
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'research_api.settings')

# Initialize Django ASGI application early to populate AppRegistry
django_asgi_app = get_asgi_application()

# Import after Django setup
from api.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})
