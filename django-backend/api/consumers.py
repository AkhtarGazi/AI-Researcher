"""
WebSocket consumer for real-time research progress updates.
"""
import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer

logger = logging.getLogger('api')


class ResearchConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer that clients connect to for real-time progress updates.
    URL: ws/research/<task_id>/
    """

    async def connect(self):
        self.task_id = self.scope['url_route']['kwargs']['task_id']
        self.group_name = f"research_{self.task_id}"

        # Join the task's channel group
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        logger.info(f"WebSocket connected for task {self.task_id}")

        # Send initial connection confirmation
        await self.send(text_data=json.dumps({
            "type": "connection_established",
            "task_id": self.task_id,
            "message": "Connected to research progress stream",
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        logger.info(f"WebSocket disconnected for task {self.task_id}")

    async def receive(self, text_data):
        """Handle incoming messages from the client (e.g., ping/pong)."""
        try:
            data = json.loads(text_data)
            if data.get("type") == "ping":
                await self.send(text_data=json.dumps({"type": "pong"}))
        except json.JSONDecodeError:
            pass

    async def research_event(self, event):
        """
        Handler for research progress events sent from the service layer.
        Called when channel_layer.group_send is invoked with type="research_event".
        """
        await self.send(text_data=json.dumps({
            "type": event.get("event", "update"),
            "data": event.get("data", {}),
            "task_id": self.task_id,
        }))
