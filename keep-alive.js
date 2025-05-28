
// Keep the bot alive and prevent auto-restart
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is alive!\n');
});

server.listen(3000, '0.0.0.0', () => {
  console.log('Keep-alive server running on port 3000');
});

// Ping self every 5 minutes to stay alive
setInterval(() => {
  try {
    http.get('http://localhost:3000', (res) => {
      console.log('Keep-alive ping successful');
    }).on('error', (err) => {
      console.log('Keep-alive ping failed:', err.message);
    });
  } catch (error) {
    console.log('Keep-alive error:', error.message);
  }
}, 5 * 60 * 1000);

module.exports = server;
