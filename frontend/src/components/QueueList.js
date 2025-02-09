import React, { useState, useEffect } from 'react';
import axios from 'axios';

const QueueList = () => {
  const [queue, setQueue] = useState([]);

  // Fetch the queue every 5 seconds.
  useEffect(() => {
    const fetchQueue = () => {
      axios.get('http://localhost:5001/api/queue')
        .then((res) => setQueue(res.data))
        .catch((err) => console.error("Error fetching queue:", err));
    };

    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
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