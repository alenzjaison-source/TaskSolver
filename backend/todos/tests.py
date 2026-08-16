from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import Task


class TodoAppTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(username='user1', password='password123', email='user1@test.com')
        self.user2 = User.objects.create_user(username='user2', password='password123', email='user2@test.com')

    def test_user_registration(self):
        response = self.client.post('/api/auth/register/', {
            'username': 'newuser',
            'email': 'new@test.com',
            'password': 'password123',
            'password_confirm': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_jwt_token_obtain_and_refresh(self):
        # Obtain token
        response = self.client.post('/api/auth/token/', {
            'username': 'user1',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

        refresh_token = response.data['refresh']

        # Refresh token
        refresh_response = self.client.post('/api/auth/token/refresh/', {
            'refresh': refresh_token
        })
        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', refresh_response.data)

    def test_unauthenticated_tasks_access_denied(self):
        response = self.client.get('/api/tasks/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_task_creation_and_owner_assignment(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.post('/api/tasks/', {'title': 'Buy groceries'})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Buy groceries')
        self.assertEqual(response.data['is_completed'], False)
        self.assertEqual(response.data['owner_username'], 'user1')

        task = Task.objects.get(id=response.data['id'])
        self.assertEqual(task.owner, self.user1)

    def test_task_scoping_isolation(self):
        # User 1 creates task
        task1 = Task.objects.create(title='Task 1 User 1', owner=self.user1)
        # User 2 creates task
        task2 = Task.objects.create(title='Task 2 User 2', owner=self.user2)

        # Authenticate as User 1
        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/tasks/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        task_ids = [t['id'] for t in response.data]
        self.assertIn(task1.id, task_ids)
        self.assertNotIn(task2.id, task_ids)

        # User 1 tries to access User 2's task
        response_detail = self.client.get(f'/api/tasks/{task2.id}/')
        self.assertEqual(response_detail.status_code, status.HTTP_404_NOT_FOUND)

        # User 1 tries to delete User 2's task
        response_delete = self.client.delete(f'/api/tasks/{task2.id}/')
        self.assertEqual(response_delete.status_code, status.HTTP_404_NOT_FOUND)

        # Authenticate as User 2
        self.client.force_authenticate(user=self.user2)
        response2 = self.client.get('/api/tasks/')
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        task_ids2 = [t['id'] for t in response2.data]
        self.assertIn(task2.id, task_ids2)
        self.assertNotIn(task1.id, task_ids2)

    def test_task_toggle_and_delete(self):
        self.client.force_authenticate(user=self.user1)
        task = Task.objects.create(title='Finish project', owner=self.user1, is_completed=False)

        # Toggle to completed
        patch_res = self.client.patch(f'/api/tasks/{task.id}/', {'is_completed': True})
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_res.data['is_completed'], True)

        task.refresh_from_db()
        self.assertTrue(task.is_completed)

        # Delete
        delete_res = self.client.delete(f'/api/tasks/{task.id}/')
        self.assertEqual(delete_res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Task.objects.filter(id=task.id).exists())
