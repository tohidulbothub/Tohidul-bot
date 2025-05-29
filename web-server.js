
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
      res.json({
        name: global.config?.BOTNAME || 'TOHI-BOT-HUB',
        status: 'online',
        uptime: process.uptime(),
        commands: global.client?.commands?.size || 0,
        events: global.client?.events?.size || 0,
        version: global.config?.version || '1.8.0',
        timestamp: new Date().toISOString()
      });
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
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

  start(port = 5000) {
    this.server = this.app.listen(port, '0.0.0.0', () => {
      console.log(`🌐 Web server started on http://0.0.0.0:${port}`);
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
