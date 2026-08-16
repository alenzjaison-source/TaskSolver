from rest_framework import viewsets, permissions
from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        """
        Return only tasks owned by the authenticated user
        """
        if getattr(self, 'swagger_fake_view', False) or not self.request.user.is_authenticated:
            return Task.objects.none()
        return Task.objects.filter(owner=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        """
        Automatically associate the task with the authenticated user
        """
        serializer.save(owner=self.request.user)
