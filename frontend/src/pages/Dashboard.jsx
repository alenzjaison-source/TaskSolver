import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import {
  Plus,
  Check,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  Circle,
  ListTodo,
  Sparkles,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [error, setError] = useState('');

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      setError('');
      const response = await api.get('/tasks/');
      setTasks(response.data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setError('Unable to load your tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Add Task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setSubmitting(true);
    try {
      const response = await api.post('/tasks/', {
        title: newTaskTitle.trim(),
      });
      setTasks((prev) => [response.data, ...prev]);
      setNewTaskTitle('');
    } catch (err) {
      console.error('Failed to create task:', err);
      setError('Failed to create task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Task Completion
  const handleToggleTask = async (task) => {
    const newStatus = !task.is_completed;
    
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, is_completed: newStatus } : t))
    );

    try {
      await api.patch(`/tasks/${task.id}/`, {
        is_completed: newStatus,
      });
    } catch (err) {
      console.error('Failed to toggle task:', err);
      // Revert optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, is_completed: task.is_completed } : t))
      );
      setError('Failed to update task status.');
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId) => {
    // Optimistic delete
    const previousTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      await api.delete(`/tasks/${taskId}/`);
    } catch (err) {
      console.error('Failed to delete task:', err);
      setTasks(previousTasks);
      setError('Failed to delete task.');
    }
  };

  // Start Edit
  const handleStartEdit = (task) => {
    setEditingId(task.id);
    setEditingText(task.title);
  };

  // Save Edit
  const handleSaveEdit = async (taskId) => {
    if (editingId !== taskId || !editingText.trim()) {
      setEditingId(null);
      return;
    }

    const updatedText = editingText.trim();
    setEditingId(null);

    try {
      const response = await api.patch(`/tasks/${taskId}/`, {
        title: updatedText,
      });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? response.data : t))
      );
    } catch (err) {
      console.error('Failed to edit task:', err);
      setError('Failed to update task title.');
      fetchTasks();
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter tasks
  const activeTasks = tasks.filter((t) => !t.is_completed);
  const completedTasks = tasks.filter((t) => t.is_completed);

  const filteredActive = activeTasks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredCompleted = completedTasks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container">
      <Navbar />

      <main className="dashboard-main">
        {/* Dashboard Top Header */}
        <header className="dashboard-header">
          <div className="header-top">
            <div>
              <h1>My Tasks</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Organize your daily goals with focused clarity
              </p>
            </div>
            <button
              onClick={fetchTasks}
              className="btn-secondary"
              title="Refresh tasks"
              id="refresh-tasks-btn"
            >
              <RefreshCw size={15} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="stats-container">
            <div className="stat-card">
              <div>
                <div className="stat-label">Total Tasks</div>
                <div className="stat-value">{tasks.length}</div>
              </div>
              <ListTodo size={26} color="var(--text-muted)" />
            </div>

            <div className="stat-card active-stat">
              <div>
                <div className="stat-label">In Progress</div>
                <div className="stat-value">{activeTasks.length}</div>
              </div>
              <Circle size={26} color="#818cf8" />
            </div>

            <div className="stat-card completed-stat">
              <div>
                <div className="stat-label">Completed</div>
                <div className="stat-value">{completedTasks.length}</div>
              </div>
              <CheckCircle2 size={26} color="#34d399" />
            </div>
          </div>
        </header>

        {/* Global Error Banner */}
        {error && (
          <div className="alert-error" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Task Input Bar */}
        <form onSubmit={handleAddTask} className="task-input-card">
          <input
            type="text"
            className="task-input-field"
            placeholder="Add a new task... (press Enter to save)"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            id="new-task-input"
          />
          <button
            type="submit"
            className="btn-add-task"
            disabled={submitting || !newTaskTitle.trim()}
            id="add-task-btn"
          >
            <Plus size={18} />
            <span>Add</span>
          </button>
        </form>

        {/* Filter Tabs & Search Controls */}
        <div className="controls-bar">
          <div className="filter-tabs">
            <button
              type="button"
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
              id="filter-all-btn"
            >
              All ({tasks.length})
            </button>
            <button
              type="button"
              className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
              id="filter-active-btn"
            >
              Active ({activeTasks.length})
            </button>
            <button
              type="button"
              className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
              id="filter-completed-btn"
            >
              Completed ({completedTasks.length})
            </button>
          </div>

          <div className="search-input-wrapper">
            <span className="input-icon">
              <Search size={15} />
            </span>
            <input
              type="text"
              className="search-input"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="search-tasks-input"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
            <div className="auth-loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p>Loading your tasks...</p>
          </div>
        )}

        {/* Task Lists */}
        {!loading && (
          <>
            {/* Global Empty State if total tasks = 0 */}
            {tasks.length === 0 ? (
              <div className="empty-state" style={{ marginTop: '1rem' }}>
                <div className="empty-icon">
                  <ListTodo size={24} />
                </div>
                <div className="empty-title">Your list is clean and empty</div>
                <div className="empty-subtitle">
                  Create your first task above to start organizing your day.
                </div>
              </div>
            ) : searchQuery && filteredActive.length === 0 && filteredCompleted.length === 0 ? (
              <div className="empty-state" style={{ marginTop: '1rem' }}>
                <div className="empty-icon">
                  <Search size={24} />
                </div>
                <div className="empty-title">No matching tasks found</div>
                <div className="empty-subtitle">
                  Try adjusting your search query "{searchQuery}".
                </div>
              </div>
            ) : (
              <>
                {/* Active Tasks Section */}
                {(filter === 'all' || filter === 'active') && (
                  <div>
                    <div className="section-title">
                      <span>Active Tasks</span>
                      <span className="section-count">{filteredActive.length}</span>
                    </div>

                    {filteredActive.length === 0 ? (
                      filter === 'active' ? (
                        <div className="empty-state">
                          <div className="empty-icon">
                            <Sparkles size={24} />
                          </div>
                          <div className="empty-title">All active tasks cleared!</div>
                          <div className="empty-subtitle">
                            Add a new task above to stay productive.
                          </div>
                        </div>
                      ) : null
                    ) : (
                      <div className="task-list">
                        {filteredActive.map((task) => (
                          <div key={task.id} className="task-item" id={`task-item-${task.id}`}>
                            <div className="task-left">
                              <button
                                type="button"
                                className="custom-checkbox"
                                onClick={() => handleToggleTask(task)}
                                title="Mark as completed"
                                id={`toggle-task-${task.id}`}
                              >
                                {task.is_completed && <Check size={14} color="#ffffff" />}
                              </button>

                              <div className="task-content">
                                {editingId === task.id ? (
                                  <input
                                    type="text"
                                    className="form-input"
                                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.9rem' }}
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveEdit(task.id);
                                      if (e.key === 'Escape') setEditingId(null);
                                    }}
                                    onBlur={() => handleSaveEdit(task.id)}
                                    autoFocus
                                  />
                                ) : (
                                  <>
                                    <div className="task-title">{task.title}</div>
                                    <div className="task-meta">
                                      <span>{formatDate(task.created_at)}</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="task-actions">
                              {editingId !== task.id && (
                                <button
                                  type="button"
                                  className="btn-icon-action"
                                  onClick={() => handleStartEdit(task)}
                                  title="Edit task"
                                  id={`edit-task-${task.id}`}
                                >
                                  <Edit2 size={15} />
                                </button>
                              )}
                              <button
                                type="button"
                                className="btn-icon-action delete"
                                onClick={() => handleDeleteTask(task.id)}
                                title="Delete task"
                                id={`delete-task-${task.id}`}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Completed Tasks Section */}
                {(filter === 'all' || filter === 'completed') && (
                  <div style={{ marginTop: filteredActive.length > 0 ? '2.5rem' : '0' }}>
                    <div className="section-title">
                      <span>Completed Tasks</span>
                      <span className="section-count">{filteredCompleted.length}</span>
                    </div>

                    {filteredCompleted.length === 0 ? (
                      filter === 'completed' ? (
                        <div className="empty-state">
                          <div className="empty-icon">
                            <CheckCircle2 size={24} />
                          </div>
                          <div className="empty-title">No completed tasks yet</div>
                          <div className="empty-subtitle">
                            Complete active tasks to see them tracked here.
                          </div>
                        </div>
                      ) : null
                    ) : (
                      <div className="task-list">
                        {filteredCompleted.map((task) => (
                          <div key={task.id} className="task-item completed" id={`task-item-${task.id}`}>
                            <div className="task-left">
                              <button
                                type="button"
                                className="custom-checkbox checked"
                                onClick={() => handleToggleTask(task)}
                                title="Mark as active"
                                id={`toggle-task-${task.id}`}
                              >
                                <Check size={14} color="#ffffff" />
                              </button>

                              <div className="task-content">
                                <div className="task-title">{task.title}</div>
                                <div className="task-meta">
                                  <span>Completed • {formatDate(task.created_at)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="task-actions">
                              <button
                                type="button"
                                className="btn-icon-action delete"
                                onClick={() => handleDeleteTask(task.id)}
                                title="Delete task"
                                id={`delete-task-${task.id}`}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
