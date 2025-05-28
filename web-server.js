
const express = require('express');
const path = require('path');
const fs = require('fs');

class WebServer {
  constructor() {
    this.app = express();
    this.server = null;
    this.setupRoutes();
  }

  setupRoutes() {
    // Serve static files from includes/cover directory
    this.app.use('/static', express.static(path.join(__dirname, 'includes', 'cover')));
    
    // Basic health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Dashboard route
    this.app.get('/', (req, res) => {
      const dashboardPath = path.join(__dirname, 'includes', 'cover', 'dashboard.html');
      if (fs.existsSync(dashboardPath)) {
        res.sendFile(dashboardPath);
      } else {
        res.send('<h1>TOHI-BOT-HUB Web Server</h1><p>Bot is running successfully!</p>');
      }
    });

    // Theme endpoint
    this.app.get('/themes', (req, res) => {
      const themePath = path.join(__dirname, 'includes', 'cover', 'html.json');
      if (fs.existsSync(themePath)) {
        try {
          const themeData = JSON.parse(fs.readFileSync(themePath, 'utf8'));
          res.json(themeData);
        } catch (error) {
          console.error('Error reading theme file:', error);
          res.status(500).json({ error: 'Failed to load theme' });
        }
      } else {
        res.status(404).json({ error: 'Theme file not found' });
      }
    });

    // Bot status endpoint
    this.app.get('/status', (req, res) => {
      res.json({
        botName: global.config?.BOTNAME || 'TOHI-BOT-HUB',
        status: 'running',
        uptime: process.uptime(),
        commands: global.client?.commands?.size || 0,
        events: global.client?.events?.size || 0
      });
    });
  }

  start(port = 5000) {
    this.server = this.app.listen(port, '0.0.0.0', () => {
      console.log(`Web server started on http://0.0.0.0:${port}`);
    });
    
    this.server.on('error', (err) => {
      console.error('Web server error:', err);
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
      console.log('Web server stopped');
    }
  }
}

module.exports = WebServer;
