import React, { useState, useEffect } from 'react';
import axios from 'axios';

const QueueList = () => {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const fetchQueue = () => {
      axios.get('http://localhost:5001/api/queue')
        .then((res) => setQueue(res.data))
        .catch((err) => console.error(err));
    };
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000); // Auto-refresh every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2>Current Queue</h2>
      <ul>
        {queue.map((entry) => (
          <li key={entry.id}>
            {entry.name} - {entry.helpTopic}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QueueList;