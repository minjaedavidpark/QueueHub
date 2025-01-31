const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory queue (replace with a database later)
let isQueuePaused = false;
let queue = [];

// Routes
app.get('/api/queue', (req, res) => {
  res.json(queue);
});

app.post('/api/queue/join', (req, res) => {
  if (isQueuePaused) {
    return res.status(403).json({ error: "Queue is paused" });
  }
  const { name, helpTopic } = req.body;
  const newEntry = {
    id: queue.length + 1,
    name,
    helpTopic,
    timestamp: new Date(),
    status: "Waiting"
  };
  queue.push(newEntry);
  res.status(201).json(newEntry);
});

app.patch('/api/admin/queue/pause', (req, res) => {
  const adminKey = req.headers['admin-key'];
  if (adminKey !== 'secret123') return res.status(401).json({ error: "Unauthorized" });

  isQueuePaused = !isQueuePaused;
  res.json({ isPaused: isQueuePaused });
});

app.patch('/api/admin/queue/:id/prioritize', (req, res) => {
  const adminKey = req.headers['admin-key'];
  if (adminKey !== 'secret123') return res.status(401).json({ error: "Unauthorized" });

  const id = parseInt(req.params.id);
  const index = queue.findIndex(entry => entry.id === id);
  if (index === -1) return res.status(404).json({ error: "Entry not found" });

  const [prioritizedEntry] = queue.splice(index, 1);
  queue.unshift(prioritizedEntry); // Move to front
  res.json(queue);
});

app.delete('/api/admin/queue/:id', (req, res) => {
  const adminKey = req.headers['admin-key'];
  if (adminKey !== 'secret123') return res.status(401).json({ error: "Unauthorized" });

  const id = parseInt(req.params.id);
  queue = queue.filter(entry => entry.id !== id);
  res.json({ message: "User removed by admin" });
});

// Start server
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});