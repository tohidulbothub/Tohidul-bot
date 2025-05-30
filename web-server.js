
const express = require('express');
const path = require('path');
const fs = require('fs');

class WebServer {
  constructor() {
    this.app = express();
    this.server = null;
    this.startTime = Date.now();
    this.requestCount = 0;
    this.pingCount = 0;
    this.lastPingTime = Date.now();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    // Request counter for monitoring
    this.app.use((req, res, next) => {
      this.requestCount++;
      next();
    });

    // Basic security headers
    this.app.use((req, res, next) => {
      res.setHeader('X-Powered-By', 'TOHI-BOT-HUB Keep-Alive');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Access-Control-Allow-Origin', '*');
      next();
    });
  }

  setupRoutes() {
    // Main keep-alive endpoint for UptimeRobot
    this.app.get('/', (req, res) => {
      this.pingCount++;
      this.lastPingTime = Date.now();
      
      const botInfo = {
        name: global.config?.BOTNAME || 'TOHI-BOT-HUB',
        status: 'Online & Active',
        uptime: this.formatUptime(process.uptime()),
        commands: global.client?.commands?.size || 0,
        events: global.client?.events?.size || 0,
        version: global.config?.version || '1.8.0',
        pingCount: this.pingCount,
        lastPing: new Date(this.lastPingTime).toLocaleString('bn-BD')
      };

      const html = `
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${botInfo.name} - Keep Alive Status</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(15px);
            border-radius: 25px;
            padding: 40px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            text-align: center;
            max-width: 600px;
            width: 90%;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .bot-name {
            font-size: 2.8em;
            font-weight: bold;
            margin-bottom: 15px;
            background: linear-gradient(45deg, #fff, #e0e0e0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        
        .status {
            display: inline-block;
            padding: 12px 25px;
            background: linear-gradient(45deg, #4CAF50, #45a049);
            border-radius: 30px;
            font-weight: bold;
            margin-bottom: 30px;
            animation: pulse 2s infinite;
            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
        }
        
        @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4); }
            50% { transform: scale(1.05); box-shadow: 0 6px 20px rgba(76, 175, 80, 0.6); }
            100% { transform: scale(1); box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4); }
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        
        .stat-item {
            background: rgba(255, 255, 255, 0.1);
            padding: 25px 15px;
            border-radius: 15px;
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .stat-item:hover {
            transform: translateY(-5px);
            background: rgba(255, 255, 255, 0.15);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
        
        .stat-number {
            font-size: 2.2em;
            font-weight: bold;
            color: #FFD700;
            text-shadow: 0 2px 5px rgba(0,0,0,0.3);
        }
        
        .stat-label {
            font-size: 0.9em;
            opacity: 0.9;
            margin-top: 8px;
            font-weight: 500;
        }
        
        .ping-info {
            background: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 15px;
            margin: 25px 0;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .ping-title {
            font-size: 1.3em;
            color: #FFD700;
            margin-bottom: 10px;
            font-weight: bold;
        }
        
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
            font-size: 0.9em;
            opacity: 0.8;
        }
        
        .keep-alive-badge {
            display: inline-block;
            background: linear-gradient(45deg, #FF6B6B, #FF8E8E);
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 0.8em;
            margin-top: 10px;
            animation: glow 3s ease-in-out infinite alternate;
        }
        
        @keyframes glow {
            from { box-shadow: 0 0 10px rgba(255, 107, 107, 0.5); }
            to { box-shadow: 0 0 20px rgba(255, 107, 107, 0.8); }
        }
        
        .url-info {
            background: rgba(0, 0, 0, 0.2);
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            font-family: monospace;
            font-size: 0.9em;
            border-left: 4px solid #FFD700;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="bot-name">${botInfo.name}</h1>
        <div class="status">🤖 ${botInfo.status}</div>
        <div class="keep-alive-badge">⚡ Keep-Alive Active</div>
        
        <div class="ping-info">
            <div class="ping-title">📡 Ping Information</div>
            <div>Total Pings: <strong>${botInfo.pingCount}</strong></div>
            <div>Last Ping: <strong>${botInfo.lastPing}</strong></div>
        </div>
        
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
        
        <div class="url-info">
            <strong>🔗 UptimeRobot URL:</strong><br>
            ${req.get('host') ? `https://${req.get('host')}` : 'Your Replit URL'}
        </div>
        
        <div class="footer">
            <p>🤖 Bot is running successfully!</p>
            <p>⏰ Add this URL to UptimeRobot with 5-minute intervals</p>
            <p>Made with ❤️ by TOHIDUL</p>
        </div>
    </div>
</body>
</html>`;
      
      res.send(html);
    });

    // Ping endpoint specifically for UptimeRobot
    this.app.get('/ping', (req, res) => {
      this.pingCount++;
      this.lastPingTime = Date.now();
      res.json({
        status: 'alive',
        message: 'Bot is running perfectly',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        botName: global.config?.BOTNAME || 'TOHI-BOT-HUB',
        pingCount: this.pingCount,
        commands: global.client?.commands?.size || 0,
        events: global.client?.events?.size || 0
      });
    });

    // Keep-alive endpoint
    this.app.get('/keep-alive', (req, res) => {
      this.pingCount++;
      this.lastPingTime = Date.now();
      res.json({
        alive: true,
        status: 'Bot is active and running',
        uptime: this.formatUptime(process.uptime()),
        timestamp: new Date().toLocaleString('bn-BD'),
        pingCount: this.pingCount,
        botInfo: {
          name: global.config?.BOTNAME || 'TOHI-BOT-HUB',
          commands: global.client?.commands?.size || 0,
          events: global.client?.events?.size || 0,
          version: global.config?.version || '1.8.0'
        }
      });
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        uptime: process.uptime(),
        memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        timestamp: new Date().toISOString(),
        pingCount: this.pingCount,
        lastPing: new Date(this.lastPingTime).toISOString()
      });
    });

    // Status API
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
        pingCount: this.pingCount,
        lastPingTime: this.lastPingTime,
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
          status: 'running',
          pingCount: this.pingCount,
          lastPing: new Date(this.lastPingTime).toLocaleString('bn-BD')
        }
      });
    });

    // Wake-up endpoint
    this.app.get('/wake', (req, res) => {
      this.pingCount++;
      this.lastPingTime = Date.now();
      res.json({
        message: 'Bot is awake and running',
        timestamp: new Date().toISOString(),
        uptime: this.formatUptime(process.uptime()),
        pingCount: this.pingCount,
        status: 'active'
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
      console.log(`🔄 Keep-Alive: http://0.0.0.0:${port}/keep-alive`);
      console.log(`📡 Ping: http://0.0.0.0:${port}/ping`);
      console.log(`\n🔗 Add this URL to UptimeRobot: https://your-repl-name.replit.app`);
    });
    
    this.server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is busy, trying port ${port + 1}`);
        this.start(port + 1);
      } else {
        console.error('Web server error:', err);
      }
    });

    // Activity tracker - just log activity
    setInterval(() => {
      const now = Date.now();
      if (now - this.lastPingTime > 120000) { // 2 minutes
        console.log('📊 Server Activity: Keep-alive system is handling pings...');
      }
    }, 300000); // Check every 5 minutes

    // Health monitoring - check bot status
    setInterval(() => {
      if (global.client && global.client.api) {
        try {
          // Check if bot is still logged in
          const botId = global.client.api.getCurrentUserID();
          if (!botId) {
            console.log('⚠️ Bot seems disconnected, may need restart');
          } else {
            console.log('💚 Bot health check passed');
          }
        } catch (error) {
          console.log('⚠️ Bot health check failed:', error.message);
        }
      }
    }, 600000); // Check every 10 minutes

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('Received SIGTERM, shutting down gracefully');
      this.server.close(() => {
        console.log('Keep-alive server stopped');
        process.exit(0);
      });
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
