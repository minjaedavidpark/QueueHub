import React, { useState, useEffect } from 'react';
import axios from 'axios';

const QueueStatusTracker = () => {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = JSON.parse(atob(token.split('.')[1])).userId;
        
        const response = await axios.get(
          `http://localhost:5001/api/queue/status/${userId}`,
          { headers: { Authorization: `Bearer ${token}` }}
        );
        
        setStatus(response.data);

        // Show browser notification when position changes
        if (status && status.position !== response.data.position) {
          showNotification(response.data.position);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setStatus(null);
        } else {
          setError('Failed to fetch status');
        }
      }
    };

    const interval = setInterval(checkStatus, 5000);
    checkStatus();

    return () => clearInterval(interval);
  }, []);

  const showNotification = (position) => {
    if (Notification.permission === "granted") {
      new Notification("Queue Update", {
        body: `Your position in queue: ${position}`,
        icon: "/favicon.ico"
      });
    }
  };

  if (!status) return null;

  return (
    <div className="queue-status-tracker">
      <h3>Your Queue Status</h3>
      <div className="status-container">
        <div className="status-item">
          <span className="status-label">Position:</span>
          <span className="status-value">{status.position}</span>
        </div>
        <div className="status-item">
          <span className="status-label">Estimated Wait:</span>
          <span className="status-value">
            {status.estimatedWaitTime < 60
              ? `${status.estimatedWaitTime} minutes`
              : `${Math.floor(status.estimatedWaitTime / 60)}h ${status.estimatedWaitTime % 60}m`}
          </span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{
              width: `${((status.queueLength - status.position + 1) / status.queueLength) * 100}%`
            }}
          />
        </div>
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default QueueStatusTracker;
