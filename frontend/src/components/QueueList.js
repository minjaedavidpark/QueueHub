import React, { useState, useEffect } from 'react';
import axios from 'axios';

const QueueList = () => {
  const [queue, setQueue] = useState([]);

  // Fetch queue every 5 seconds
  useEffect(() => {
    const fetchQueue = () => {
      axios.get('http://localhost:5001/api/queue')
        .then((res) => setQueue(res.data));
    };
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLeave = (id) => {
    axios.delete(`http://localhost:5001/api/queue/leave/${id}`)
      .then(() => {
        setQueue(queue.filter(entry => entry.id !== id));
      });
  };

  return (
    <div>
      <h2>Current Queue</h2>
      <ul>
        {queue.map((entry) => (
          <li key={entry.id}>
            {entry.name} - {entry.helpTopic}
            <button onClick={() => handleLeave(entry.id)}>Leave</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QueueList;