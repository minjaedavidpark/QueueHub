const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replace with a database later)
let users = [];
const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

// In-memory queue (replace with a database later)
let isQueuePaused = false;
let queue = [];
let nextId = 1;

const AVERAGE_HELP_TIME_MINUTES = 15; // Average time spent helping each student

// Add these new routes before your existing routes
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: "Username already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: users.length + 1,
    username,
    password: hashedPassword,
  };
  
  users.push(newUser);
  res.status(201).json({ message: "User registered successfully" });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET);
  res.json({ token });
});

// Middleware to verify JWT token
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Routes

// Get the current queue
app.get('/api/queue', (req, res) => {
  res.json(queue);
});

// Student joins the queue
app.post('/api/queue/join', authenticateUser, (req, res) => {
  if (isQueuePaused) {
    return res.status(403).json({ error: "Queue is paused" });
  }

  const user = users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  // Check if user is already in queue
  if (queue.some(entry => entry.userId === req.userId)) {
    return res.status(400).json({ error: "You are already in queue" });
  }

  const { helpTopic, previousAttempts, deadlineProximity, firstTimeAsking } = req.body;
  const newEntry = {
    id: nextId++,
    userId: req.userId,
    name: user.username,
    helpTopic,
    timestamp: new Date(),
    status: "Waiting",
    estimatedWaitTime: queue.length * AVERAGE_HELP_TIME_MINUTES, // in minutes
    position: queue.length + 1,
    previousAttempts,
    deadlineProximity,
    firstTimeAsking,
    waitTime: 0,
    priorityScore: calculatePriorityScore({
      previousAttempts,
      deadlineProximity,
      firstTimeAsking,
      waitTime: 0
    })
  };
  
  // Insert into queue based on priority score
  const insertIndex = queue.findIndex(entry => entry.priorityScore < newEntry.priorityScore);
  if (insertIndex === -1) {
    queue.push(newEntry);
  } else {
    queue.splice(insertIndex, 0, newEntry);
  }
  
  res.status(201).json(newEntry);
});

// Add a new endpoint to get user's position and wait time
app.get('/api/queue/status/:userId', authenticateUser, (req, res) => {
  const entry = queue.find(e => e.userId === parseInt(req.params.userId));
  if (!entry) {
    return res.status(404).json({ error: "Not in queue" });
  }

  const position = queue.findIndex(e => e.userId === parseInt(req.params.userId)) + 1;
  const estimatedWaitTime = (position - 1) * AVERAGE_HELP_TIME_MINUTES;

  res.json({
    position,
    estimatedWaitTime,
    queueLength: queue.length,
    helpTopic: entry.helpTopic,
    status: entry.status
  });
});

// Add a new route to leave queue
app.post('/api/queue/leave', authenticateUser, (req, res) => {
  const index = queue.findIndex(entry => entry.userId === req.userId);
  
  if (index === -1) {
    return res.status(404).json({ error: "You are not in the queue" });
  }

  queue.splice(index, 1);
  res.json({ message: "Successfully left the queue" });
});

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

// Add a background task to update wait times and recalculate priorities
setInterval(() => {
  queue = queue.map(entry => {
    const updatedEntry = {
      ...entry,
      waitTime: Math.floor((Date.now() - entry.timestamp) / 60000) // Convert to minutes
    };
    updatedEntry.priorityScore = calculatePriorityScore(updatedEntry);
    return updatedEntry;
  });
  
  // Re-sort queue based on updated priority scores
  queue.sort((a, b) => b.priorityScore - a.priorityScore);
}, 60000); // Update every minute

// Start server
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

const calculatePriorityScore = (student) => {
  let score = 0;
  
  // Factors that affect priority:
  if (student.previousAttempts > 0) score += 10; // Student has tried to solve independently
  if (student.deadlineProximity < 24) score += 15; // Urgent deadline within 24 hours
  if (student.waitTime > 30) score += 20; // Long wait time bonus
  if (student.firstTimeAsking) score += 5; // Encourage new students to seek help
  
  return score;
};