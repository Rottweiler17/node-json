// index.js
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000; // Use Vercel's PORT env var

// Serve static files from the v1 directory
app.use('/v1', express.static(path.join(__dirname, 'v1')));

// Basic route to test server
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Start the server (optional for Vercel, but good for local testing)
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Export the app for Vercel
module.exports = app;