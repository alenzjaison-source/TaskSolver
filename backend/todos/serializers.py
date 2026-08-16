from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Task
        fields = ('id', 'title', 'is_completed', 'created_at', 'owner', 'owner_username')
        read_only_fields = ('id', 'created_at', 'owner', 'owner_username')
