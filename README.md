# Django + React JWT Auth Architecture & Minimalist To-Do App

A full-stack, production-grade boilerplate featuring a **Django REST Framework (DRF)** backend with **Simple JWT authentication** and a modern **React + Vite** frontend with Axios interceptors for automatic token refreshing and protected routing.

---

## 🌟 Features

### 1. Django REST Framework Backend
- **Authentication**: Simple JWT `TokenObtainPairView` & `TokenRefreshView`.
  - Access Token: 1-hour expiration
  - Refresh Token: 1-day expiration with token rotation
- **Security & Scoping**:
  - `IsAuthenticated` set as DRF's global default permission class.
  - Models include `owner = models.ForeignKey(User, on_delete=models.CASCADE)`.
  - `TaskViewSet` overrides `get_queryset()` to filter strictly by `owner=request.user`.
  - `perform_create()` automatically binds created tasks to the authenticated user.
- **CORS**: Configured with `django-cors-headers` to support Vite development on `http://localhost:5173`.

### 2. React Frontend
- **State Management**: `AuthContext` provides global authentication state (`user`, `login`, `register`, `logout`).
- **Axios Interceptors**:
  - **Request Interceptor**: Automatically attaches `Authorization: Bearer <accessToken>` to every outgoing API request.
  - **Response Interceptor**: Automatically intercepts `401 Unauthorized` responses, calls the `/api/auth/token/refresh/` endpoint with the refresh token, updates storage, and transparently retries the failed request.
- **Protected Routes**: `<ProtectedRoute>` wrapper redirects unauthenticated users to `/login`.
- **Minimalist To-Do UI**:
  - Task creation input bar with keyboard shortcut (`Enter`).
  - Active tasks list with inline editing, deletion, and real-time completion toggle.
  - Dedicated **Completed Tasks** section with strike-through styling.
  - Real-time task statistics (Total, In Progress, Completed).
  - Search & filter tabs (All, Active, Completed).

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm

---

### Backend Setup

1. Open a terminal in the `backend/` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Apply database migrations:
   ```bash
   python manage.py migrate
   ```

5. Run automated tests:
   ```bash
   python manage.py test
   ```

6. Start the development server:
   ```bash
   python manage.py runserver 127.0.0.1:8000
   ```

---

### Frontend Setup

1. Open a second terminal in the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to **`http://localhost:5173`**.

---

## 📁 Project Structure

```
Project/
├── backend/
│   ├── authentication/
│   │   ├── serializers.py      # User & Register serializers
│   │   ├── urls.py             # /api/auth/ endpoints
│   │   └── views.py            # Register & User profile views
│   ├── core/
│   │   ├── settings.py         # DRF, SimpleJWT, and CORS configuration
│   │   └── urls.py             # Root URL routing
│   ├── todos/
│   │   ├── models.py           # Task model (title, is_completed, owner, created_at)
│   │   ├── serializers.py      # Task serializer with owner details
│   │   ├── tests.py            # Unit & isolation test suite
│   │   ├── urls.py             # /api/tasks/ endpoint router
│   │   └── views.py            # TaskViewSet with get_queryset scoping
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js        # Axios instance with JWT refresh interceptors
    │   ├── components/
    │   │   ├── Navbar.jsx      # Top navigation with user badge & logout
    │   │   └── ProtectedRoute.jsx # Route protection wrapper
    │   ├── context/
    │   │   └── AuthContext.jsx # Global auth state & login/register/logout actions
    │   ├── pages/
    │   │   ├── Dashboard.jsx   # Minimalist To-Do dashboard
    │   │   ├── Login.jsx       # Login page
    │   │   └── Register.jsx    # Registration page
    │   ├── App.jsx             # React router setup
    │   ├── App.css
    │   ├── index.css           # Design tokens & dark minimalist styles
    │   └── main.jsx
    ├── index.html
    └── package.json
```

---

## 🔒 API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register/` | Register a new user | No |
| `POST` | `/api/auth/token/` | Obtain Access & Refresh token pair | No |
| `POST` | `/api/auth/token/refresh/` | Refresh expired access token | No |
| `GET` | `/api/auth/me/` | Get current user's profile | **Yes (JWT)** |
| `GET` | `/api/tasks/` | List current user's tasks | **Yes (JWT)** |
| `POST` | `/api/tasks/` | Create a new task | **Yes (JWT)** |
| `GET` | `/api/tasks/{id}/` | Retrieve task details | **Yes (JWT)** |
| `PATCH` | `/api/tasks/{id}/` | Toggle task or update title | **Yes (JWT)** |
| `DELETE` | `/api/tasks/{id}/` | Delete task | **Yes (JWT)** |
