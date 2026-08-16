import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="dashboard-navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <div className="brand-icon">
            <CheckSquare size={20} />
          </div>
          <span className="brand-title">Minimalist Tasks</span>
        </div>

        <div className="navbar-actions">
          {user && (
            <div className="user-badge">
              <div className="user-avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span>{user.username}</span>
            </div>
          )}

          <button
            onClick={logout}
            className="btn-ghost"
            title="Sign out of your account"
            id="logout-btn"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
