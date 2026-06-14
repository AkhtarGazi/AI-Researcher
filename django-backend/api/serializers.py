"""
DRF serializers for research task data.
"""
from rest_framework import serializers
from .models import ResearchTask, ResearchStep


class ResearchStepSerializer(serializers.ModelSerializer):
    """Serializer for individual research steps."""

    class Meta:
        model = ResearchStep
        fields = ['id', 'step_name', 'status', 'timestamp', 'result']
        read_only_fields = ['id', 'timestamp']


class ResearchTaskSerializer(serializers.ModelSerializer):
    """Full serializer for research tasks with nested steps."""
    steps = ResearchStepSerializer(many=True, read_only=True)

    class Meta:
        model = ResearchTask
        fields = [
            'id', 'topic', 'status', 'created_at', 'updated_at',
            'search_results', 'scraped_content', 'report', 'critique',
            'error_message', 'duration_seconds', 'steps',
        ]
        read_only_fields = [
            'id', 'status', 'created_at', 'updated_at',
            'search_results', 'scraped_content', 'report', 'critique',
            'error_message', 'duration_seconds',
        ]


class ResearchTaskListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for task lists (no heavy JSON fields)."""
    quality_score = serializers.SerializerMethodField()

    class Meta:
        model = ResearchTask
        fields = [
            'id', 'topic', 'status', 'created_at', 'updated_at',
            'duration_seconds', 'quality_score',
        ]

    def get_quality_score(self, obj):
        """Extract quality score from critique if available."""
        if obj.critique and isinstance(obj.critique, dict):
            return obj.critique.get('score')
        return None


class ResearchCreateSerializer(serializers.Serializer):
    """Serializer for creating a new research task."""
    topic = serializers.CharField(min_length=5, max_length=500)

    def validate_topic(self, value):
        """Validate the research topic."""
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Topic cannot be empty.")
        return value
