const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory queue (replace with a database later)
let queue = [
  { id: 1, name: "Alice", helpTopic: "React", timestamp: new Date() },
  { id: 2, name: "Bob", helpTopic: "Node.js", timestamp: new Date() }
];

// Routes
app.get('/api/queue', (req, res) => {
  res.json(queue);
});

app.post('/api/queue/join', (req, res) => {
  const { name, helpTopic } = req.body;
  const newEntry = {
    id: queue.length + 1,
    name,
    helpTopic,
    timestamp: new Date()
  };
  queue.push(newEntry);
  res.status(201).json(newEntry);
});

app.delete('/api/queue/leave/:id', (req, res) => {
  const id = parseInt(req.params.id);
  queue = queue.filter(entry => entry.id !== id);
  res.json({ message: 'Removed from queue' });
});

// Start server
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});