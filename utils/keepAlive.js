
const axios = require('axios');
const logger = require('./log');

class KeepAlive {
  constructor() {
    this.isActive = true;
    this.pingInterval = 4 * 60 * 1000; // 4 minutes
    this.maxRetries = 3;
    this.retryDelay = 30000; // 30 seconds
    this.lastPingTime = Date.now();
    this.pingCount = 0;
    this.failureCount = 0;
  }

  async selfPing(url) {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'TOHI-BOT-HUB Keep-Alive Service'
        }
      });
      
      this.pingCount++;
      this.lastPingTime = Date.now();
      this.failureCount = 0;
      
      logger.log(`🔄 Keep-Alive Ping #${this.pingCount} successful`, 'KEEP_ALIVE');
      return true;
    } catch (error) {
      this.failureCount++;
      logger.log(`❌ Keep-Alive Ping failed (${this.failureCount}/${this.maxRetries}): ${error.message}`, 'KEEP_ALIVE');
      return false;
    }
  }

  async start(baseUrl = null) {
    if (!this.isActive) return;

    // Auto-detect URL if not provided
    const url = baseUrl || process.env.REPL_SLUG 
      ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.replit.app/ping`
      : 'http://localhost:3000/ping';

    logger.log(`🚀 Keep-Alive service started`, 'KEEP_ALIVE');
    logger.log(`📡 Ping URL: ${url}`, 'KEEP_ALIVE');

    const pingLoop = async () => {
      if (!this.isActive) return;

      const success = await this.selfPing(url);
      
      if (!success && this.failureCount >= this.maxRetries) {
        logger.log(`⚠️ Keep-Alive failed ${this.maxRetries} times, waiting longer...`, 'KEEP_ALIVE');
        setTimeout(pingLoop, this.retryDelay);
      } else {
        setTimeout(pingLoop, this.pingInterval);
      }
    };

    // Start first ping after 30 seconds
    setTimeout(pingLoop, 30000);

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
