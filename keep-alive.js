
const http = require('http');
const express = require('express');
const app = express();

// Simple ping endpoint
app.get('/', (req, res) => {
  res.send('Bot is alive!');
});

const server = app.listen(3001, () => {
  console.log('Keep-alive server running on port 3001');
});

// Self-ping every 5 minutes to prevent sleeping
setInterval(() => {
  http.get('http://localhost:3001', (res) => {
    console.log('Keep-alive ping successful');
  }).on('error', (err) => {
    console.log('Keep-alive ping failed:', err.message);
  });
}, 5 * 60 * 1000); // 5 minutes

module.exports = server;
