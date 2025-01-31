import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [queue, setQueue] = useState([]);
  const [password, setPassword] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState('');

  // Fetch queue when authenticated
  useEffect(() => {
    if (password === '1') {
      fetchAdminQueue();
    }
  }, [password]);

  const fetchAdminQueue = () => {
    axios.get('http://localhost:5001/api/admin/queue', {
      headers: { 'admin-key': password }
    })
    .then((res) => {
      setQueue(res.data);
      setIsPaused(res.data.isPaused); // If backend returns pause status
    })
    .catch(() => setError("Invalid admin password"));
  };

  const togglePause = () => {
    axios.patch('http://localhost:5001/api/admin/queue/pause', {}, {
      headers: { 'admin-key': password }
    })
    .then((res) => setIsPaused(res.data.isPaused))
    .catch(() => setError("Failed to toggle pause"));
  };

  const prioritizeUser = (id) => {
    axios.patch("http://localhost:5001/api/admin/queue/${id}/prioritize", {}, {
      headers: { 'admin-key': password }
    })
    .then(() => fetchAdminQueue())
    .catch(() => setError("Failed to prioritize"));
  };

  const removeUser = (id) => {
    axios.delete("http://localhost:5001/api/admin/queue/${id}", {
      headers: { 'admin-key': password }
    })
    .then(() => fetchAdminQueue())
    .catch(() => setError("Failed to remove user"));
  };
return (
    <div className="admin-panel">
      <h2>Admin Controls</h2>
      <input
        type="password"
        placeholder="Admin Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="error">{error}</p>}

      {password === 'secret123' && (
        <div>
          <button onClick={togglePause}>
            {isPaused ? "Resume Queue" : "Pause Queue"}
          </button>

          <h3>Manage Queue</h3>
          <ul>
            {queue.map((entry) => (
              <li key={entry.id}>
                {entry.name} - {entry.helpTopic}
                {entry.status === "waiting" && (
                  <>
                    <button onClick={() => prioritizeUser(entry.id)}>
                      Prioritize
                    </button>
                    <button onClick={() => removeUser(entry.id)}>
                      Remove
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;