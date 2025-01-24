import express from 'express';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';
import cors from 'cors';
import { createUser, getUsers, getUser } from './controllers/userController.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
connectDB();

// Routes
app.post('/api/users', createUser);
app.get('/api/users', getUsers);
app.get('/api/users/:id', getUser);

// Basic route for health check
app.get('/', (req, res) => {
  res.status(200).json({ message: 'HomeBase API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server with port fallback
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle port in use error
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    const altPort = PORT + 1;
    console.log(`Port ${PORT} is in use, trying port ${altPort}...`);
    app.listen(altPort, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${altPort}`);
    });
  } else {
    console.error('Server error:', error);
  }
});
