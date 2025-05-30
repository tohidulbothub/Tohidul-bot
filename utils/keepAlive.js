
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
  start(intervalMinutes = 5) {
    if (this.isActive) {
      console.log('⚠️ Keep-alive service is already running');
      return;
    }

    this.isActive = true;
    const interval = intervalMinutes * 60 * 1000; // Convert to milliseconds

    // Self-ping to current server
    this.addUrl('http://0.0.0.0:3000/ping');

    console.log(`🚀 Starting keep-alive service (ping every ${intervalMinutes} minutes)`);

    this.pingInterval = setInterval(() => {
      this.pingUrls();
    }, interval);

    // Initial ping
    setTimeout(() => this.pingUrls(), 5000); // Wait 5 seconds then start
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

    console.log(`🔄 Pinging ${this.urls.length} URLs for keep-alive...`);

    for (const url of this.urls) {
      try {
        await this.pingUrl(url);
        this.stats.successfulPings++;
      } catch (error) {
        this.stats.failedPings++;
        console.log(`❌ Failed to ping ${url}: ${error.message}`);
      }
      this.stats.totalPings++;
    }

    this.stats.lastPing = new Date().toISOString();
    
    console.log(`📊 Keep-alive stats: ${this.stats.successfulPings}/${this.stats.totalPings} successful`);
  }

  // Ping a single URL
  pingUrl(url) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const isHttps = url.startsWith('https');
      const client = isHttps ? https : http;

      const req = client.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'TOHI-BOT-KeepAlive/1.0'
        }
      }, (res) => {
        const responseTime = Date.now() - startTime;
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
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

      req.setTimeout(10000);
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

  // Add external monitoring service URLs
  addMonitoringServices() {
    // You can add URLs from uptime monitoring services here
    // For example: UptimeRobot, Pingdom, etc.
    console.log('📡 Ready to add external monitoring services');
  }
}

module.exports = KeepAlive;
