
const http = require('http');
const https = require('https');

class KeepAlive {
  constructor() {
    this.isActive = false;
    this.pingInterval = null;
    this.urls = [];
    this.stats = {
      totalPings: 0,
      successfulPings: 0,
      failedPings: 0,
      lastPing: null
    };
  }

  // Add URLs to ping for keep-alive
  addUrl(url) {
    if (!this.urls.includes(url)) {
      this.urls.push(url);
      console.log(`✅ Added keep-alive URL: ${url}`);
    }
  }

  // Start keep-alive service
  start(intervalMinutes = 3) { // Reduced to 3 minutes for better reliability
    if (this.isActive) {
      console.log('⚠️ Keep-alive service is already running');
      return;
    }

    this.isActive = true;
    const interval = intervalMinutes * 60 * 1000; // Convert to milliseconds

    // Self-ping to current server (both HTTP and HTTPS)
    this.addUrl('http://0.0.0.0:3000/ping');
    this.addUrl(`https://${process.env.REPL_SLUG || 'tohi-bot-hub'}.${process.env.REPL_OWNER || 'yanmaglinte'}.repl.co/ping`);
    
    // Add external monitoring services for better uptime
    this.addExternalMonitoringServices();

    console.log(`🚀 Starting 24/7 keep-alive service (ping every ${intervalMinutes} minutes)`);

    this.pingInterval = setInterval(() => {
      this.pingUrls();
    }, interval);

    // Initial ping after 10 seconds
    setTimeout(() => this.pingUrls(), 10000);
  }

  // Stop keep-alive service
  stop() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
      this.isActive = false;
      console.log('🛑 Keep-alive service stopped');
    }
  }

  // Ping all registered URLs
  async pingUrls() {
    if (this.urls.length === 0) {
      console.log('⚠️ No URLs to ping');
      return;
    }

    console.log(`🔄 Pinging ${this.urls.length} URLs for 24/7 keep-alive...`);

    for (const url of this.urls) {
      try {
        await this.pingUrl(url);
        this.stats.successfulPings++;
      } catch (error) {
        this.stats.failedPings++;
        // Only log critical errors, not timeouts or connection issues
        if (!error.message.includes('timeout') && !error.message.includes('ECONNRESET')) {
          console.log(`❌ Failed to ping ${url}: ${error.message}`);
        }
      }
      this.stats.totalPings++;
    }

    this.stats.lastPing = new Date().toISOString();
    
    const successRate = ((this.stats.successfulPings / this.stats.totalPings) * 100).toFixed(1);
    console.log(`📊 Keep-alive stats: ${this.stats.successfulPings}/${this.stats.totalPings} successful (${successRate}%)`);
  }

  // Ping a single URL with better error handling
  pingUrl(url) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const isHttps = url.startsWith('https');
      const client = isHttps ? https : http;

      const req = client.get(url, {
        timeout: 15000, // Increased timeout
        headers: {
          'User-Agent': 'TOHI-BOT-KeepAlive/2.0',
          'Accept': '*/*',
          'Connection': 'keep-alive'
        }
      }, (res) => {
        const responseTime = Date.now() - startTime;
        
        if (res.statusCode >= 200 && res.statusCode < 400) {
          console.log(`✅ Pinged ${url} successfully (${responseTime}ms)`);
          resolve(res.statusCode);
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }

        // Consume response data to free up memory
        res.resume();
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.setTimeout(15000);
    });
  }

  // Get keep-alive statistics
  getStats() {
    return {
      ...this.stats,
      isActive: this.isActive,
      urlCount: this.urls.length,
      successRate: this.stats.totalPings > 0 
        ? ((this.stats.successfulPings / this.stats.totalPings) * 100).toFixed(2) + '%' 
        : '0%'
    };
  }

  // Add external monitoring service URLs for better uptime
  addExternalMonitoringServices() {
    // Get the Replit URL for this project
    const replSlug = process.env.REPL_SLUG || 'tohi-bot-hub';
    const replOwner = process.env.REPL_OWNER || 'yanmaglinte';
    const replUrl = `https://${replSlug}.${replOwner}.repl.co`;
    
    // Add multiple endpoints for redundancy
    this.addUrl(`${replUrl}/health`);
    this.addUrl(`${replUrl}/ping`);
    this.addUrl(`${replUrl}/uptime`);
    
    console.log('📡 Added external monitoring services for 24/7 uptime');
    console.log(`🌐 Your bot will stay alive at: ${replUrl}`);
  }

  // Enhanced status reporting
  getDetailedStatus() {
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    return {
      service: 'TOHI-BOT 24/7 Keep-Alive',
      status: this.isActive ? 'Active' : 'Inactive',
      uptime: `${days}d ${hours}h ${minutes}m`,
      urls: this.urls,
      stats: this.getStats(),
      lastPing: this.stats.lastPing,
      nextPing: this.isActive ? 'In 3 minutes' : 'Service stopped'
    };
  }
}

module.exports = KeepAlive;
