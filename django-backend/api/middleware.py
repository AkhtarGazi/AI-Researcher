"""
Custom middleware for request logging and rate limiting.
"""
import time
import logging
from collections import defaultdict
from django.conf import settings
from django.http import JsonResponse

logger = logging.getLogger('api')


class RequestLoggingMiddleware:
    """Logs all incoming API requests with timing information."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.time()
        response = self.get_response(request)
        duration = round((time.time() - start) * 1000, 2)

        if request.path.startswith('/api/'):
            logger.info(
                f"{request.method} {request.path} → {response.status_code} ({duration}ms)"
            )

        return response


class RateLimitMiddleware:
    """
    Simple in-memory rate limiting per IP address.
    Only applies to POST requests on /api/ endpoints.
    """

    def __init__(self, get_response):
        self.get_response = get_response
        self.requests = defaultdict(list)  # IP -> [timestamps]
        self.max_requests = getattr(settings, 'RATE_LIMIT_REQUESTS', 10)
        self.window = getattr(settings, 'RATE_LIMIT_WINDOW', 60)

    def __call__(self, request):
        if request.method == 'POST' and request.path.startswith('/api/'):
            ip = self._get_client_ip(request)
            now = time.time()

            # Clean old entries
            self.requests[ip] = [
                t for t in self.requests[ip] if now - t < self.window
            ]

            if len(self.requests[ip]) >= self.max_requests:
                return JsonResponse({
                    "success": False,
                    "data": None,
                    "error": {
                        "code": "RATE_LIMITED",
                        "message": f"Too many requests. Max {self.max_requests} per {self.window}s.",
                        "details": None,
                    }
                }, status=429)

            self.requests[ip].append(now)

        return self.get_response(request)

    def _get_client_ip(self, request):
        x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded:
            return x_forwarded.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', '0.0.0.0')
