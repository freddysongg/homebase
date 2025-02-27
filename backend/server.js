import express from 'express';
import { connectDB } from './config/db.js';
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import cors from 'cors';
import { createUser, getUsers, getUser } from './controllers/userController.js';
import { createChore, deleteChore, getChore, getChores, updateChore } from './controllers/choreController.js';
import { loginUser } from './controllers/loginController.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
connectDB();

// JWT Secret Key
const SECRET_KEY = process.env.JWT_SECRET || "default_secret_key";

// 🔹 Middleware to verify JWT Token (For protected routes)
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // Attach user info to the request
    next();
  } catch (error) {
    return res.status(403).json({ message: "Forbidden: Invalid token" });
  }
};

// Routes

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Simulated database user lookup (Replace with actual DB query)
    const user = { id: "123", email: "test@example.com", password: "password123" };

    if (email !== user.email || password !== user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Generate JWT Token
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: "1h" });

    return res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/protected", verifyToken, (req, res) => {
  res.json({ message: "Welcome to the protected route!", user: req.user });
});

app.post('/api/users', createUser);
app.get('/api/users', getUsers);
app.get('/api/users/:id', getUser);

app.post('/api/chores', createChore);
app.get('/api/chores', getChores);
app.get('/api/chores/:id', getChore);
app.put('/api/chores/:id', updateChore);
app.delete('/api/chores/:id', deleteChore);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'HomeBase API is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 50001;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    const altPort = PORT + 1;
    console.log(`Port ${PORT} is in use, trying port ${altPort}...`);
    app.listen(altPort, () => {
      console.log(`Server running on port ${altPort}`);
    });
  } else {
    console.error('Server error:', error);
  }
});