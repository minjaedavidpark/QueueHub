import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = ({ adminKey, onLogout }) => {
  const [queue, setQueue] = useState([]);
  const [error, setError] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  // State for adding a new user via the admin interface
  const [newUserName, setNewUserName] = useState('');
  const [newUserHelpTopic, setNewUserHelpTopic] = useState('React');

  // Fetch the current queue when the component mounts
  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = () => {
    axios
      .get('http://localhost:5001/api/queue')
      .then((res) => setQueue(res.data))
      .catch((err) => {
        console.error("Error fetching queue:", err);
        setError("Error fetching queue.");
      });
  };

  // Toggle the queue's pause/resume state
  const togglePause = () => {
    axios
      .patch('http://localhost:5001/api/admin/queue/pause', {}, {
        headers: { 'admin-key': adminKey }
      })
      .then((res) => {
        setIsPaused(res.data.isPaused);
      })
      .catch((err) => {
        console.error("Failed to toggle pause:", err);
        setError("Failed to toggle pause.");
      });
  };

  // Remove a user from the queue (admin-only)
  const removeUser = (id) => {
    axios
      .delete(`http://localhost:5001/api/admin/queue/${id}`, {
        headers: { 'admin-key': adminKey }
      })
      .then(() => {
        setQueue(queue.filter((user) => user.id !== id));
      })
      .catch((err) => {
        console.error("Failed to remove user:", err);
        setError("Failed to remove user.");
      });
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    const data = {
      name: newUserName,
      helpTopic: newUserHelpTopic,
    };
    axios
      .post('http://localhost:5001/api/queue/join', data, {
        headers: { 
          'admin-key': adminKey,  // Add admin key header
          'Content-Type': 'application/json' 
        }
      })
      .then((res) => {
        setQueue([...queue, res.data]);
        setNewUserName('');
        setNewUserHelpTopic('React');
      })
      .catch((err) => {
        console.error("Failed to add user:", err);
        setError("Failed to add user.");
      });
  };

  return (
    <div>
      <h2>Admin Queue Management</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={togglePause}>
          {isPaused ? "Resume Queue" : "Pause Queue"}
        </button>{' '}
        <button onClick={onLogout}>Back to User View</button>
      </div>

      {/* Section to allow the admin to add a new user */}
      <div style={{ marginBottom: '1rem' }}>
        <h3>Add User to Queue</h3>
        <form onSubmit={handleAddUser}>
          <input
            type="text"
            placeholder="User Name"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            required
          />
          <select
            value={newUserHelpTopic}
            onChange={(e) => setNewUserHelpTopic(e.target.value)}
          >
            <option value="React">React</option>
            <option value="Node.js">Node.js</option>
            <option value="Database">Database</option>
          </select>
          <button type="submit">Add User</button>
        </form>
      </div>

      {/* Display the current queue */}
      <ul>
        {queue.map((user) => (
          <li key={user.id}>
            {user.name} - {user.helpTopic}{' '}
            <button onClick={() => removeUser(user.id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPanel;