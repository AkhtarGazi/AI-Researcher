class ResearchWebSocket {
    constructor(taskId, onMessage, onOpen, onClose, onError) {
        const wsBase = import.meta.env.VITE_WS_BASE_URL || 'ws://127.0.0.1:8000';
        this.url = `${wsBase}/ws/research/${taskId}/`;
        this.onMessage = onMessage;
        this.onOpen = onOpen;
        this.onClose = onClose;
        this.onError = onError;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.manualClose = false;
    }

    connect() {
        try {
            this.ws = new WebSocket(this.url);

            this.ws.onopen = () => {
                console.log(`WebSocket connected: ${this.url}`);
                this.reconnectAttempts = 0;
                if (this.onOpen) this.onOpen();
            };

            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (this.onMessage) this.onMessage(data);
            };

            this.ws.onclose = (event) => {
                if (!this.manualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
                    console.log('WebSocket closed, attempting reconnect...');
                    this.reconnectAttempts++;
                    setTimeout(() => this.connect(), 1000 * Math.pow(2, this.reconnectAttempts));
                }
                if (this.onClose) this.onClose(event);
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                if (this.onError) this.onError(error);
            };
        } catch (err) {
            console.error('WebSocket connection failed:', err);
            if (this.onError) this.onError(err);
        }
    }

    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }

    close() {
        this.manualClose = true;
        if (this.ws) {
            this.ws.close();
        }
    }
}

export default ResearchWebSocket;
