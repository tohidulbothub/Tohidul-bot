
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
      try {
        if (fs.existsSync(themePath)) {
          const rawData = fs.readFileSync(themePath, 'utf8');
          if (rawData.trim() === '' || rawData.trim() === '{}') {
            // If file is empty or contains empty object, return default theme
            const defaultTheme = {
              "THEME_COLOR": "#1702CF",
              "primary": "#1702CF", 
              "secondary": "#11019F",
              "tertiary": "#1401BF",
              "background": "#000000",
              "text": "#ffffff",
              "accent": "#1702CF"
            };
            res.json(defaultTheme);
            return;
          }
          
          const themeData = JSON.parse(rawData);
          
          // Validate theme data structure
          if (!themeData || typeof themeData !== 'object' || !themeData.THEME_COLOR) {
            throw new Error('Invalid theme structure');
          }
          
          res.json(themeData);
        } else {
          // Create default theme file if it doesn't exist
          const defaultTheme = {
            "THEME_COLOR": "#1702CF",
            "primary": "#1702CF",
            "secondary": "#11019F", 
            "tertiary": "#1401BF",
            "background": "#000000",
            "text": "#ffffff",
            "accent": "#1702CF"
          };
          fs.writeFileSync(themePath, JSON.stringify(defaultTheme, null, 2));
          res.json(defaultTheme);
        }
      } catch (error) {
        console.error('Error processing theme file:', error);
        // Return default theme as fallback
        const defaultTheme = {
          "THEME_COLOR": "#1702CF",
          "primary": "#1702CF",
          "secondary": "#11019F",
          "tertiary": "#1401BF", 
          "background": "#000000",
          "text": "#ffffff",
          "accent": "#1702CF"
        };
        res.json(defaultTheme);
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
