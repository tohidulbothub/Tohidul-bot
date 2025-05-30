
const axios = require('axios');
const logger = require('./log');

class KeepAlive {
  constructor() {
    this.isActive = true;
    this.pingInterval = 1 * 60 * 1000; // 1 minute
    this.maxRetries = 3;
    this.retryDelay = 30000; // 30 seconds
    this.lastPingTime = Date.now();
    this.pingCount = 0;
    this.failureCount = 0;
  }

  async selfPing(url) {
    try {
      // Use internal ping instead of external URL to avoid SSL issues
      const http = require('http');
      
      return new Promise((resolve) => {
        const options = {
          hostname: '0.0.0.0',
          port: 3000,
          path: '/ping',
          method: 'GET',
          timeout: 5000
        };
        
        const req = http.request(options, (res) => {
          this.pingCount++;
          this.lastPingTime = Date.now();
          this.failureCount = 0;
          logger.log(`🔄 Internal Keep-Alive Ping #${this.pingCount} successful`, 'KEEP_ALIVE');
          resolve(true);
        });
        
        req.on('error', () => {
          this.failureCount++;
          logger.log(`❌ Internal Keep-Alive Ping failed (${this.failureCount}/${this.maxRetries})`, 'KEEP_ALIVE');
          resolve(false);
        });
        
        req.on('timeout', () => {
          req.destroy();
          this.failureCount++;
          logger.log(`⏰ Internal Keep-Alive Ping timeout (${this.failureCount}/${this.maxRetries})`, 'KEEP_ALIVE');
          resolve(false);
        });
        
        req.end();
      });
    } catch (error) {
      this.failureCount++;
      logger.log(`❌ Keep-Alive error: ${error.message}`, 'KEEP_ALIVE');
      return false;
    }
  }

  async start(baseUrl = null) {
    if (!this.isActive) return;

    logger.log(`🚀 Keep-Alive service started - Internal ping mode`, 'KEEP_ALIVE');
    logger.log(`📡 Ping Target: Internal server (localhost:3000/ping)`, 'KEEP_ALIVE');
    logger.log(`⏰ Ping Interval: Every 1 minute`, 'KEEP_ALIVE');

    const pingLoop = async () => {
      if (!this.isActive) return;

      const success = await this.selfPing();
      
      if (!success && this.failureCount >= this.maxRetries) {
        logger.log(`⚠️ Keep-Alive failed ${this.maxRetries} times, waiting longer...`, 'KEEP_ALIVE');
        setTimeout(pingLoop, this.retryDelay);
      } else {
        setTimeout(pingLoop, this.pingInterval);
      }
    };

    // Start first ping immediately
    setTimeout(pingLoop, 5000); // Start after 5 seconds

    // Heartbeat monitor
    setInterval(() => {
      const timeSinceLastPing = Date.now() - this.lastPingTime;
      if (timeSinceLastPing > this.pingInterval * 2) {
        logger.log(`💓 Heartbeat: ${Math.floor(timeSinceLastPing / 1000)}s since last ping`, 'KEEP_ALIVE');
      }
    }, 60000); // Check every minute
  }

  stop() {
    this.isActive = false;
    logger.log('🛑 Keep-Alive service stopped', 'KEEP_ALIVE');
  }

  getStats() {
    return {
      isActive: this.isActive,
      pingCount: this.pingCount,
      failureCount: this.failureCount,
      lastPingTime: this.lastPingTime,
      uptime: process.uptime()
    };
  }
}

module.exports = KeepAlive;
