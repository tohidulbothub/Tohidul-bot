
const express = require('express');
const fs = require('fs-extra');
const path = require('path');

class WebServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 5000;
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.static('includes/cover'));
  }

  setupRoutes() {
    // Main dashboard route
    this.app.get('/', (req, res) => {
      try {
        const htmlPath = path.join(__dirname, 'includes/cover/index.html');
        if (fs.existsSync(htmlPath)) {
          res.sendFile(htmlPath);
        } else {
          res.send('<h1>TOHI-BOT-HUB</h1><p>Bot is running successfully!</p>');
        }
      } catch (error) {
        res.status(500).send('Server Error');
      }
    });

    // Dashboard route
    this.app.get('/dashboard', (req, res) => {
      try {
        const dashboardPath = path.join(__dirname, 'includes/cover/dashboard.html');
        if (fs.existsSync(dashboardPath)) {
          res.sendFile(dashboardPath);
        } else {
          res.json({ status: 'Bot is running', commands: global.client?.commands?.size || 0 });
        }
      } catch (error) {
        res.status(500).json({ error: 'Dashboard error' });
      }
    });

    // Reviews route
    this.app.get('/reviews', (req, res) => {
      try {
        const reviewsPath = path.join(__dirname, 'includes/cover/reviews.html');
        if (fs.existsSync(reviewsPath)) {
          res.sendFile(reviewsPath);
        } else {
          res.json({ message: 'Reviews not available' });
        }
      } catch (error) {
        res.status(500).json({ error: 'Reviews error' });
      }
    });

    // API status route
    this.app.get('/api/status', (req, res) => {
      res.json({
        status: 'online',
        uptime: process.uptime(),
        commands: global.client?.commands?.size || 0,
        events: global.client?.events?.size || 0,
        timestamp: new Date().toISOString()
      });
    });
  }

  start() {
    this.server = this.app.listen(this.port, '0.0.0.0', () => {
      console.log(`🌐 Web server running on http://0.0.0.0:${this.port}`);
    });
    
    this.server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`Port ${this.port} is busy, trying another port...`);
        this.port = this.port + 1;
        setTimeout(() => this.start(), 1000);
      } else {
        console.error('Web server error:', error);
      }
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
    }
  }
}

module.exports = WebServer;
