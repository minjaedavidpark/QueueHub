import React, { useState, useEffect } from 'react';
import axios from 'axios';

const QueueList = () => {
  const [queue, setQueue] = useState([]);
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  // Fetch the queue every 5 seconds.
  useEffect(() => {
    const fetchQueue = () => {
      axios.get('http://localhost:5001/api/queue')
        .then((res) => setQueue(res.data))
        .catch((err) => console.error("Error fetching queue:", err));
    };

    fetchQueue();
    const interval = setInterval(fetchQueue, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="queue-list">
      <h3>Current Queue</h3>
      {queue.length === 0 ? (
        <p>Queue is empty</p>
      ) : (
        <ul>
          {queue.map((entry) => (
            <li key={entry.id} className="queue-item">
              <div className="queue-item-header">
                <span className="name">{entry.name}</span>
                <span className="topic">{entry.helpTopic}</span>
              </div>
              {(isAdmin || entry.userId === JSON.parse(atob(localStorage.getItem('token').split('.')[1])).userId) && (
                <div className="question">
                  <strong>Question:</strong> {entry.question}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QueueList;