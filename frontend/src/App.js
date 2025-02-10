import React, { useState } from 'react';
import QueueList from './components/QueueList';          // Component to display the queue (user view)
import AdminPanel from './components/AdminPanel';        // Component for admin controls
import JoinQueueForm from './components/JoinQueueForm';  // Form for users to join the queue
import Auth from './components/Auth';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token')
  );

  // Handle admin login form submission
  const handleAdminLogin = (e) => {
    e.preventDefault();
    const enteredKey = e.target.elements.adminKey.value;
    // For simplicity, we use "secret123" as the valid admin key
    if (enteredKey === 'secret123') {
      setIsAdmin(true);
      setAdminKey(enteredKey);
    } else {
      alert('Invalid admin key. Please try again.');
    }
  };

  const handleLogin = (token) => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
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

  return (
    <div className="App">
      <h2>User View</h2>
      <button onClick={handleLogout}>Logout</button>
      {/* JoinQueueForm allows users to add themselves to the queue */}
      <JoinQueueForm />
      {/* QueueList displays the current queue */}
      <QueueList />
      
      {/* Button to show/hide admin login form */}
      <button onClick={() => setShowAdminLogin(!showAdminLogin)}>
        {showAdminLogin ? 'Cancel Admin Login' : 'Admin Login'}
      </button>

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
  );
}

export default App;