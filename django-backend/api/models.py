"""
Database models for research tasks and progress tracking.
"""
import uuid
from django.db import models


class ResearchTask(models.Model):
    """Stores a single research task and its results."""

    STATUS_CHOICES = [
        ('queued', 'Queued'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    topic = models.CharField(max_length=500)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='queued')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Results stored as JSON
    search_results = models.JSONField(null=True, blank=True)
    scraped_content = models.JSONField(null=True, blank=True)
    report = models.JSONField(null=True, blank=True)
    critique = models.JSONField(null=True, blank=True)

    # Error tracking
    error_message = models.TextField(null=True, blank=True)

    # Duration tracking
    duration_seconds = models.FloatField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Research Task'
        verbose_name_plural = 'Research Tasks'

    def __str__(self):
        return f"[{self.status}] {self.topic[:60]}"


class ResearchStep(models.Model):
    """Tracks individual steps within a research task for progress reporting."""

    STEP_CHOICES = [
        ('search', 'Search'),
        ('scrape', 'Scrape'),
        ('write', 'Write'),
        ('critique', 'Critique'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(
        ResearchTask,
        on_delete=models.CASCADE,
        related_name='steps'
    )
    step_name = models.CharField(max_length=20, choices=STEP_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    timestamp = models.DateTimeField(auto_now=True)
    result = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ['timestamp']
        unique_together = ['task', 'step_name']

    def __str__(self):
        return f"{self.task.topic[:30]} → {self.step_name} [{self.status}]"
