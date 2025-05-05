// Server for Render deployment
const express = require('express');
const path = require('path');
const { registerRoutes } = require('./server/routes');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Register all API routes
registerRoutes(app).then(() => {
  console.log('Routes registered successfully');
}).catch(err => {
  console.error('Error registering routes:', err);
});

// For any other GET request, serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});