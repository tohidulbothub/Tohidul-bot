
const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');

class WebServer {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    // Performance middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    });

    // Static files
    this.app.use('/static', express.static(path.join(__dirname, 'includes/cover')));
  }

  setupRoutes() {
    // API Routes
    this.app.get('/api/bot-info', (req, res) => {
      res.json({
        name: global.config.BOTNAME || 'TOHI-BOT',
        version: require('./package.json').version,
        prefix: global.config.PREFIX || '/',
        uptime: process.uptime(),
        commands: global.client ? global.client.commands.size : 0,
        events: global.client ? global.client.events.size : 0,
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
      });
    });

    this.app.get('/api/commands', (req, res) => {
      if (!global.client || !global.client.commands) {
        return res.json({ commands: [] });
      }

      const commands = Array.from(global.client.commands.values()).map(cmd => ({
        name: cmd.config.name,
        description: cmd.config.description,
        category: cmd.config.commandCategory,
        usePrefix: cmd.config.usePrefix,
        permission: cmd.config.hasPermssion || 0
      }));

      res.json({ commands, total: commands.length });
    });

    this.app.get('/api/stats', (req, res) => {
      res.json({
        users: global.data ? global.data.allUserID.length : 0,
        threads: global.data ? global.data.allThreadID.length : 0,
        banned_users: global.data ? global.data.userBanned.size : 0,
        banned_threads: global.data ? global.data.threadBanned.size : 0,
        nsfw_threads: global.data ? global.data.threadAllowNSFW.length : 0
      });
    });

    // Dashboard
    this.app.get('/', (req, res) => {
      const dashboardPath = path.join(__dirname, 'includes/cover/dashboard.html');
      if (fs.existsSync(dashboardPath)) {
        res.sendFile(dashboardPath);
      } else {
        res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>TOHI-BOT-HUB Dashboard</title>
            <style>
              body { font-family: Arial, sans-serif; background: #1a1a1a; color: #fff; padding: 20px; }
              .container { max-width: 800px; margin: 0 auto; }
              .card { background: #2d2d2d; padding: 20px; margin: 10px 0; border-radius: 8px; }
              .status { color: #4CAF50; }
              .metric { display: inline-block; margin: 10px; padding: 10px; background: #3d3d3d; border-radius: 4px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🤖 TOHI-BOT-HUB Dashboard</h1>
              <div class="card">
                <h2>Bot Status: <span class="status">Online</span></h2>
                <div class="metric">Commands: <span id="commands">Loading...</span></div>
                <div class="metric">Events: <span id="events">Loading...</span></div>
                <div class="metric">Uptime: <span id="uptime">Loading...</span></div>
              </div>
              <div class="card">
                <h3>API Endpoints:</h3>
                <ul>
                  <li><a href="/api/bot-info">/api/bot-info</a> - Bot information</li>
                  <li><a href="/api/commands">/api/commands</a> - Command list</li>
                  <li><a href="/api/stats">/api/stats</a> - Bot statistics</li>
                </ul>
              </div>
            </div>
            <script>
              fetch('/api/bot-info')
                .then(r => r.json())
                .then(data => {
                  document.getElementById('commands').textContent = data.commands;
                  document.getElementById('events').textContent = data.events;
                  document.getElementById('uptime').textContent = Math.floor(data.uptime) + 's';
                });
            </script>
          </body>
          </html>
        `);
      }
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });
  }

  start(port = 5000) {
    this.server.listen(port, '0.0.0.0', () => {
      console.log(`🌐 Web server running on port ${port}`);
      console.log(`📊 Dashboard: http://localhost:${port}`);
      console.log(`🔗 API: http://localhost:${port}/api/bot-info`);
    });

    return this.server;
  }
}

module.exports = WebServer;
