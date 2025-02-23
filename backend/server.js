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

app.post('/api/queue/join', (req, res) => {
  const adminKey = req.headers['admin-key'];
  const isAdmin = adminKey === '123';

  if (isAdmin) {
    // Admin adding a user (existing code)
    const { name, helpTopic } = req.body;
    if (!name || !helpTopic) {
      return res.status(400).json({ error: "Name and help topic required" });
    }

    const newEntry = {
      id: nextId++,
      userId: -1, // Special ID for admin-added users
      name,
      helpTopic,
      timestamp: new Date(),
      status: "Waiting",
      estimatedWaitTime: queue.length * 15,
      position: queue.length + 1,
      question: '',
      previousAttempts: 0,
      deadlineProximity: 'none',
      firstTimeAsking: false
    };

    queue.push(newEntry);
    return res.status(201).json(newEntry);
  }

  // Regular user authentication
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Existing user join logic
    if (queue.some(entry => entry.userId === userId)) {
      return res.status(400).json({ error: "You are already in queue" });
    }

    const { helpTopic, previousAttempts, deadlineProximity, firstTimeAsking, question } = req.body;

    const newEntry = {
      id: nextId++,
      userId,
      name: user.username,
      helpTopic,
      question,
      timestamp: new Date(),
      status: "Waiting",
      estimatedWaitTime: queue.length * 15,
      position: queue.length + 1,
      previousAttempts,
      deadlineProximity,
      firstTimeAsking
    };

    queue.push(newEntry);
    res.status(201).json(newEntry);

  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
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
  if (adminKey !== '123') return res.status(401).json({ error: "Unauthorized" });

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
  if (adminKey !== '123') return res.status(401).json({ error: "Unauthorized" });

  isQueuePaused = !isQueuePaused;
  res.json({ isPaused: isQueuePaused });
});

// Prioritize a user (move their entry to the front of the queue)
app.patch('/api/admin/queue/:id/prioritize', (req, res) => {
  const adminKey = req.headers['admin-key'];
  if (adminKey !== '123') return res.status(401).json({ error: "Unauthorized" });

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
  if (adminKey !== '123') return res.status(401).json({ error: "Unauthorized" });

  const id = parseInt(req.params.id);
  queue = queue.filter(entry => entry.id !== id);
  res.json({ message: "User removed by admin" });
});

// Mock AI suggestions based on topics and keywords
const generateSuggestions = (question, topic) => {
  const suggestions = [];
  const lowercaseQuestion = question.toLowerCase();

  // React-related suggestions
  if (topic === 'React' || lowercaseQuestion.includes('react')) {
    if (lowercaseQuestion.includes('state') || lowercaseQuestion.includes('useState')) {
      suggestions.push({
        title: 'Understanding React State',
        description: 'Learn about React state management and hooks.',
        links: [
          { title: 'React State Docs', url: 'https://react.dev/learn/state-a-components-memory' },
          { title: 'useState Hook Guide', url: 'https://react.dev/reference/react/useState' }
        ]
      });
    }
    if (lowercaseQuestion.includes('effect') || lowercaseQuestion.includes('useEffect')) {
      suggestions.push({
        title: 'Side Effects in React',
        description: 'Master the useEffect hook and component lifecycle.',
        links: [
          { title: 'useEffect Docs', url: 'https://react.dev/reference/react/useEffect' },
          { title: 'Common useEffect Patterns', url: 'https://react.dev/learn/synchronizing-with-effects' }
        ]
      });
    }
  }

  // Node.js-related suggestions
  if (topic === 'Node.js' || lowercaseQuestion.includes('node')) {
    if (lowercaseQuestion.includes('express') || lowercaseQuestion.includes('server')) {
      suggestions.push({
        title: 'Express.js Fundamentals',
        description: 'Learn about routing, middleware, and request handling in Express.',
        links: [
          { title: 'Express Guide', url: 'https://expressjs.com/en/guide/routing.html' },
          { title: 'Middleware Explained', url: 'https://expressjs.com/en/guide/using-middleware.html' }
        ]
      });
    }
  }

  // Database-related suggestions
  if (topic === 'Database' || lowercaseQuestion.includes('database') || lowercaseQuestion.includes('sql')) {
    suggestions.push({
      title: 'Database Fundamentals',
      description: 'Understanding database queries and operations.',
      links: [
        { title: 'SQL Basics', url: 'https://www.w3schools.com/sql/' },
        { title: 'Database Design', url: 'https://www.postgresql.org/docs/current/tutorial.html' }
      ]
    });
  }

  // Add a general programming suggestion if no specific matches
  if (suggestions.length === 0) {
    suggestions.push({
      title: 'Programming Best Practices',
      description: 'General programming concepts and problem-solving strategies.',
      links: [
        { title: 'Debugging Guide', url: 'https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Cross_browser_testing/JavaScript' },
        { title: 'Clean Code Principles', url: 'https://github.com/ryanmcdermott/clean-code-javascript' }
      ]
    });
  }

  return suggestions;
};

// AI suggestions endpoint
app.post('/api/ai/suggest', (req, res) => {
  const { question, topic } = req.body;
  
  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  const suggestions = generateSuggestions(question, topic);
  res.json({ suggestions });
});

// Start server
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});