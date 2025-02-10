import React, { useState } from 'react';
import axios from 'axios';

function JoinQueueForm() {
  const [helpTopic, setHelpTopic] = useState('React');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    axios.post('http://localhost:5001/api/queue/join', 
      { helpTopic },
      { headers: { Authorization: `Bearer ${token}` }}
    )
      .then(() => {
        alert('Successfully joined the queue!');
      })
      .catch((error) => {
        setError(error.response?.data?.error || 'Failed to join queue');
      });
  };

  const handleLeaveQueue = () => {
    const token = localStorage.getItem('token');
    
    axios.post('http://localhost:5001/api/queue/leave', 
      {},
      { headers: { Authorization: `Bearer ${token}` }}
    )
      .then(() => {
        alert('Successfully left the queue!');
      })
      .catch((error) => {
        setError(error.response?.data?.error || 'Failed to leave queue');
      });
  };

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <select value={helpTopic} onChange={(e) => setHelpTopic(e.target.value)}>
          <option>React</option>
          <option>Node.js</option>
          <option>Database</option>
        </select>
        <button type="submit">Join Queue</button>
      </form>
      <button onClick={handleLeaveQueue}>Leave Queue</button>
    </div>
  );
}

export default JoinQueueForm;