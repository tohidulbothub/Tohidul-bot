
const express = require('express');
const path = require('path');
const fs = require('fs');

class WebServer {
  constructor() {
    this.app = express();
    this.server = null;
    this.startTime = Date.now();
    this.requestCount = 0;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupKeepAlive();
  }

  setupMiddleware() {
    // Request counter for monitoring
    this.app.use((req, res, next) => {
      this.requestCount++;
      next();
    });

    // Basic security headers
    this.app.use((req, res, next) => {
      res.setHeader('X-Powered-By', 'TOHI-BOT-HUB');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      next();
    });
  }

  setupKeepAlive() {
    // Self-ping to keep the server alive
    setInterval(() => {
      try {
        const http = require('http');
        const options = {
          hostname: '0.0.0.0',
          port: 3000,
          path: '/health',
          method: 'GET',
          timeout: 5000
        };

        const req = http.request(options, (res) => {
          // Server is responding
        });

        req.on('error', (err) => {
          console.log('Keep-alive ping failed:', err.message);
        });

        req.on('timeout', () => {
          req.abort();
        });

        req.end();
      } catch (error) {
        console.log('Keep-alive error:', error.message);
      }
    }, 300000); // Ping every 5 minutes

    // Memory cleanup
    setInterval(() => {
      if (global.gc) {
        global.gc();
      }
    }, 600000); // Run garbage collection every 10 minutes
  }

  setupRoutes() {
    // Basic bot status page
    this.app.get('/', (req, res) => {
      const botInfo = {
        name: global.config?.BOTNAME || 'TOHI-BOT-HUB',
        status: 'Online',
        uptime: this.formatUptime(process.uptime()),
        commands: global.client?.commands?.size || 0,
        events: global.client?.events?.size || 0,
        version: global.config?.version || '1.8.0'
      };

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${botInfo.name} - Bot Status</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            text-align: center;
            max-width: 500px;
            width: 90%;
        }
        
        .bot-name {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 10px;
            background: linear-gradient(45deg, #fff, #e0e0e0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .status {
            display: inline-block;
            padding: 8px 20px;
            background: #4CAF50;
            border-radius: 25px;
            font-weight: bold;
            margin-bottom: 30px;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 30px;
        }
        
        .stat-item {
            background: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 15px;
            transition: transform 0.3s ease;
        }
        
        .stat-item:hover {
            transform: translateY(-5px);
        }
        
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #FFD700;
        }
        
        .stat-label {
            font-size: 0.9em;
            opacity: 0.8;
            margin-top: 5px;
        }
        
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
            font-size: 0.9em;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="bot-name">${botInfo.name}</h1>
        <div class="status">${botInfo.status}</div>
        
        <div class="stats">
            <div class="stat-item">
                <div class="stat-number">${botInfo.commands}</div>
                <div class="stat-label">Commands</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${botInfo.events}</div>
                <div class="stat-label">Events</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${botInfo.uptime}</div>
                <div class="stat-label">Uptime</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${botInfo.version}</div>
                <div class="stat-label">Version</div>
            </div>
        </div>
        
        <div class="footer">
            <p>🤖 Bot is running successfully!</p>
            <p>Made with ❤️ by TOHIDUL</p>
        </div>
    </div>
</body>
</html>`;
      
      res.send(html);
    });

    // API endpoint for bot status
    this.app.get('/api/status', (req, res) => {
      const memUsage = process.memoryUsage();
      res.json({
        name: global.config?.BOTNAME || 'TOHI-BOT-HUB',
        status: 'online',
        uptime: process.uptime(),
        serverUptime: Math.floor((Date.now() - this.startTime) / 1000),
        commands: global.client?.commands?.size || 0,
        events: global.client?.events?.size || 0,
        version: global.config?.version || '1.8.0',
        requestCount: this.requestCount,
        memory: {
          used: Math.round(memUsage.heapUsed / 1024 / 1024),
          total: Math.round(memUsage.heapTotal / 1024 / 1024),
          external: Math.round(memUsage.external / 1024 / 1024)
        },
        timestamp: new Date().toISOString(),
        platform: process.platform,
        nodeVersion: process.version
      });
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        uptime: process.uptime(),
        memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        timestamp: new Date().toISOString() 
      });
    });

    // Enhanced keep-alive endpoint
    this.app.get('/ping', (req, res) => {
      res.status(200).json({
        status: 'alive',
        bot: global.config?.BOTNAME || 'TOHI-BOT-HUB',
        uptime: this.formatUptime(process.uptime()),
        timestamp: new Date().toISOString(),
        message: '24/7 Keep-Alive Active'
      });
    });
    
    // Keep-alive status endpoint
    this.app.get('/keepalive', (req, res) => {
      res.status(200).json({
        service: 'TOHI-BOT 24/7 Keep-Alive',
        status: 'Active',
        uptime: this.formatUptime(process.uptime()),
        memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        bot_status: 'Online',
        message: 'Your bot is running 24/7!'
      });
    });

    // Uptime endpoint
    this.app.get('/uptime', (req, res) => {
      const uptime = process.uptime();
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      
      res.json({
        uptime: {
          raw: uptime,
          formatted: `${days}d ${hours}h ${minutes}m ${seconds}s`
        },
        serverUptime: Math.floor((Date.now() - this.startTime) / 1000),
        bot: {
          name: global.config?.BOTNAME || 'TOHI-BOT-HUB',
          status: 'running'
        }
      });
    });

    // Wake-up endpoint for external monitoring services
    this.app.get('/wake', (req, res) => {
      res.json({
        message: 'Bot is awake and running',
        timestamp: new Date().toISOString(),
        uptime: this.formatUptime(process.uptime())
      });
    });
  }

  formatUptime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    } else if (mins > 0) {
      return `${mins}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  start(port = 3000) {
    this.server = this.app.listen(port, '0.0.0.0', () => {
      console.log(`🌐 Keep-alive server started on http://0.0.0.0:${port}`);
      console.log(`📊 Health check: http://0.0.0.0:${port}/health`);
      console.log(`📈 Status API: http://0.0.0.0:${port}/api/status`);
      console.log(`⏰ Uptime: http://0.0.0.0:${port}/uptime`);
    });
    
    this.server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is busy, trying port ${port + 1}`);
        this.start(port + 1);
      } else {
        console.error('Web server error:', err);
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('Received SIGTERM, shutting down gracefully');
      this.server.close(() => {
        console.log('Keep-alive server stopped');
        process.exit(0);
      });
    });

    // Keep server alive with periodic logs
    setInterval(() => {
      console.log(`🔄 Keep-alive: Server running for ${this.formatUptime(process.uptime())}`);
    }, 1800000); // Log every 30 minutes
  }

  stop() {
    if (this.server) {
      this.server.close();
      console.log('Web server stopped');
    }
  }
}

module.exports = WebServer;
