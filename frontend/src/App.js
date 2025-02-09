import React, { useState } from 'react';
import QueueList from './components/QueueList';          // Component to display the queue (user view)
import AdminPanel from './components/AdminPanel';        // Component for admin controls
import JoinQueueForm from './components/JoinQueueForm';  // Form for users to join the queue

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);

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

  // Log out admin and return to user view
  const handleLogout = () => {
    setIsAdmin(false);
    setAdminKey('');
  };

  if (isAdmin) {
    // Render admin view if logged in as admin
    return <AdminPanel adminKey={adminKey} onLogout={handleLogout} />;
  }

  return (
    <div className="App">
      <h2>User View</h2>
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