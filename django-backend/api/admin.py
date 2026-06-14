from django.contrib import admin
from .models import ResearchTask, ResearchStep


@admin.register(ResearchTask)
class ResearchTaskAdmin(admin.ModelAdmin):
    list_display = ['id', 'topic', 'status', 'created_at', 'duration_seconds']
    list_filter = ['status', 'created_at']
    search_fields = ['topic']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(ResearchStep)
class ResearchStepAdmin(admin.ModelAdmin):
    list_display = ['task', 'step_name', 'status', 'timestamp']
    list_filter = ['status', 'step_name']
