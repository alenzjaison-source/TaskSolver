from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

# Simple root route function
def home(request):
    return JsonResponse({"message": "Task Solver Backend is running!"})

urlpatterns = [
    path('', home),  # <-- This handles the root URL
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/', include('todos.urls')),
]