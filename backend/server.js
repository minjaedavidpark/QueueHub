const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory queue (replace with a database later)
let isQueuePaused = false;
let queue = [];
let nextId = 1;

// Routes

// Get the current queue
app.get('/api/queue', (req, res) => {
  res.json(queue);
});

// Student joins the queue
app.post('/api/queue/join', (req, res) => {
  if (isQueuePaused) {
    return res.status(403).json({ error: "Queue is paused" });
  }
  const { name, helpTopic } = req.body;
  const newEntry = {
    id: nextId++,
    name,
    helpTopic,
    timestamp: new Date(),
    status: "Waiting"
  };
  queue.push(newEntry);
  res.status(201).json(newEntry);
});

// STUDENT LEAVE ENDPOINT
// Allows a student to remove themselves from the queue.
// Expects the queue entry id as a URL parameter.
// STUDENT LEAVE ENDPOINT
// Allows a student to remove themselves from the queue.
// app.delete('/api/queue/leave/:id', (req, res) => {
//   const id = parseInt(req.params.id);
//   const index = queue.findIndex(entry => entry.id === id);
//   if (index === -1) {
//     return res.status(404).json({ error: "Entry not found" });
//   }
//   queue.splice(index, 1);
//   res.json({ message: "Successfully left the queue" });
// });
app.delete('/api/admin/queue/:id', (req, res) => {
  const adminKey = req.headers['admin-key'];
  if (adminKey !== 'secret123') return res.status(401).json({ error: "Unauthorized" });

  const id = parseInt(req.params.id);
  const index = queue.findIndex(entry => entry.id === id);
  if (index === -1) return res.status(404).json({ error: "Entry not found" });

  queue.splice(index, 1);
  res.json({ message: "User removed by admin" });
});

// ADMIN ROUTES

// Toggle pause/resume the queue
app.patch('/api/admin/queue/pause', (req, res) => {
  const adminKey = req.headers['admin-key'];
  if (adminKey !== 'secret123') return res.status(401).json({ error: "Unauthorized" });

  isQueuePaused = !isQueuePaused;
  res.json({ isPaused: isQueuePaused });
});

// Prioritize a user (move their entry to the front of the queue)
app.patch('/api/admin/queue/:id/prioritize', (req, res) => {
  const adminKey = req.headers['admin-key'];
  if (adminKey !== 'secret123') return res.status(401).json({ error: "Unauthorized" });

  const id = parseInt(req.params.id);
  const index = queue.findIndex(entry => entry.id === id);
  if (index === -1) return res.status(404).json({ error: "Entry not found" });

  const [prioritizedEntry] = queue.splice(index, 1);
  queue.unshift(prioritizedEntry); // Move to the front
  res.json(queue);
});

// Admin can remove a user from the queue
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