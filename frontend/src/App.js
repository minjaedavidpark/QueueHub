import React, { useState } from 'react';
import QueueList from './components/QueueList';          // Component to display the queue (user view)
import AdminPanel from './components/AdminPanel';        // Component for admin controls
import JoinQueueForm from './components/JoinQueueForm';  // Form for users to join the queue
import Auth from './components/Auth';
import QueueStatusTracker from './components/QueueStatusTracker';
import './styles/App.css';

function App() {
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');
  const [adminKey, setAdminKey] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token')
  );

  // Handle admin login form submission
  const handleAdminLogin = (e) => {
    e.preventDefault();
    const enteredKey = e.target.elements.adminKey.value;
    // For simplicity, we use "123" as the valid admin key
    if (enteredKey === '123') {
      setIsAdmin(true);
      setAdminKey(enteredKey);
    } else {
      alert('Invalid admin key. Please try again.');
    }
  };

  const handleLogin = (token, isAdminUser) => {
    setIsAuthenticated(true);
    setIsAdmin(isAdminUser);
    if (isAdminUser) {
      setAdminKey('123'); // Set admin key for API calls
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setAdminKey('');
  };

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  if (isAdmin) {
    // Render admin view if logged in as admin
    return <AdminPanel adminKey={adminKey} onLogout={handleLogout} />;
  }

  if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
  }

  return (
    <>
      <div className="floating-objects">
        <div className="float-1"></div>
        <div className="float-2"></div>
        <div className="float-3"></div>
      </div>
      
      <div className="App">
        <nav className="header-nav">
          <h2>User View</h2>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </nav>
        
        {/* Left Sidebar */}
        <JoinQueueForm />
        
        {/* Main Content */}
        <div className="main-content">
          <QueueStatusTracker />
          <QueueList />
        </div>

        {showAdminLogin && (
          <form onSubmit={handleAdminLogin}>
            <input
              type="password"
              name="adminKey"
              placeholder="Enter admin key"
              required
            />
            <button type="submit">Login as Admin</button>
          </form>
        )}
      </div>
    </>
  );
}

export default App;