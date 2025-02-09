import React, { useState } from 'react';
import axios from 'axios';

function JoinQueueForm() {
  const [name, setName] = useState('');
  const [helpTopic, setHelpTopic] = useState('React');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    axios.post('http://localhost:5001/api/queue/join', { name, helpTopic })
      .then(() => {
        setName('');
        alert('Successfully joined the queue!');
      })
      .catch((error) => {
        let errorMessage = 'Failed to join queue. Please try again.';
        if (error.response) {
          errorMessage = error.response.data.error || errorMessage;
        }
        alert(errorMessage);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <select value={helpTopic} onChange={(e) => setHelpTopic(e.target.value)}>
        <option>React</option>
        <option>Node.js</option>
        <option>Database</option>
      </select>
      <button type="submit">Join Queue</button>
    </form>
  );
}

export default JoinQueueForm;