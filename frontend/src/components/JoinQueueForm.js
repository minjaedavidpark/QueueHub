import React, { useState } from 'react';
import axios from 'axios';

function JoinQueueForm() {
  const [helpTopic, setHelpTopic] = useState('React');
  const [previousAttempts, setPreviousAttempts] = useState(0);
  const [deadlineProximity, setDeadlineProximity] = useState(48);
  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!question.trim()) {
      setError('Please describe what you need help with');
      return;
    }

    axios.post('http://localhost:5001/api/queue/join', 
      {
        helpTopic,
        previousAttempts,
        deadlineProximity,
        firstTimeAsking: localStorage.getItem(`asked_${helpTopic}`) === null,
        question: question.trim()
      },
      { headers: { Authorization: `Bearer ${token}` }}
    )
      .then(() => {
        localStorage.setItem(`asked_${helpTopic}`, 'true');
        alert('Successfully joined the queue!');
        setQuestion(''); // Clear the question field after successful submission
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
    <div className="card join-queue-form">
      <div className="form-control">
        <h3>Join Queue</h3>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Topic:</label>
            <select value={helpTopic} onChange={(e) => setHelpTopic(e.target.value)}>
              <option value="React">React</option>
              <option value="Node.js">Node.js</option>
              <option value="Database">Database</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>What do you need help with?</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Briefly describe your question or issue..."
              rows="3"
              maxLength="200"
              required
            />
            <small>{200 - question.length} characters remaining</small>
          </div>

          <div className="form-group">
            <label>How many times have you tried to solve this?</label>
            <input
              type="number"
              min="0"
              value={previousAttempts}
              onChange={(e) => setPreviousAttempts(parseInt(e.target.value))}
            />
          </div>
          
          <div className="form-group">
            <label>Hours until deadline:</label>
            <input
              type="number"
              min="1"
              max="168"
              value={deadlineProximity}
              onChange={(e) => setDeadlineProximity(parseInt(e.target.value))}
            />
          </div>
          
          <button type="submit">Join Queue</button>
        </form>
        <button onClick={handleLeaveQueue}>Leave Queue</button>
      </div>
    </div>
  );
}

export default JoinQueueForm;