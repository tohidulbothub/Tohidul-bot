const logger = require('./utils/log');
const cron = require('node-cron');
const fs = require('fs-extra');
const chalk = require('chalk');

/**
 * ═══════════════════════════════════════════════════════════
 *                  TOHI-BOT-HUB CUSTOM
 *              Advanced Bot Custom Functions
 *               Created by TOHI-BOT-HUB Team
 *        GitHub: https://github.com/YANDEVA/TOHI-BOT-HUB
 * ═══════════════════════════════════════════════════════════
 */

module.exports = ({ api }) => {
  // System startup message
  logger.log("TOHI-BOT-HUB Custom functions initialized", "CUSTOM");

  // Store cron tasks for later cleanup
  const cronTasks = [];

  // Error recovery system
  function initErrorRecovery() {
    process.on('uncaughtException', (error) => {
      const ignoredErrors = [
        'Rate limited',
        'status code 429',
        'socket hang up',
        'ECONNRESET',
        'ETIMEDOUT'
      ];

      const shouldIgnore = ignoredErrors.some(ignored => 
        error.message && error.message.includes(ignored)
      );

      if (!shouldIgnore) {
        logger.log(`Uncaught exception handled: ${error.message}`, "RECOVERY");

        // Attempt to save critical data before potential crash
        try {
          const errorLog = {
            timestamp: new Date().toISOString(),
            error: error.message,
            stack: error.stack
          };

          fs.writeFileSync('./utils/error_log.json', JSON.stringify(errorLog, null, 2));
        } catch (saveError) {
          console.error('Failed to save error log:', saveError);
        }
      }
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.log(`Unhandled rejection handled: ${reason}`, "RECOVERY");
    });
  }

  // Performance optimization
  function initPerformanceOptimization() {
    // Clear require cache periodically to prevent memory leaks
    setInterval(() => {
      const cacheSize = Object.keys(require.cache).length;
      if (cacheSize > 1000) {
        // Clear non-essential cached modules
        Object.keys(require.cache).forEach(key => {
          if (key.includes('node_modules') && !key.includes('fca-unofficial')) {
            delete require.cache[key];
          }
        });
        logger.log(`✓ Cleared require cache (${cacheSize} entries)`, "PERFORMANCE");
      }
    }, 300000); // Every 5 minutes

    // Garbage collection hint
    if (global.gc) {
      setInterval(() => {
        global.gc();
        logger.log("✓ Garbage collection completed", "PERFORMANCE");
      }, 600000); // Every 10 minutes
    }
  }

  // Bot status announcement
  function initStatusAnnouncement() {
    // Announce bot online status
    setTimeout(() => {
      logger.log("🚀 TOHI-BOT-HUB is now fully operational!", "STATUS");
      logger.log(`📊 Commands: ${global.client?.commands?.size || 0}, Events: ${global.client?.events?.size || 0}`, "STATUS");
      logger.log(`🌐 Prefix: ${global.config.PREFIX || '/'}, Language: ${global.config.language || 'en'}`, "STATUS");
      logger.log(`💾 Memory usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`, "STATUS");
    }, 5000);
  }

  // Initialize all systems
  try {
    initErrorRecovery();
    initPerformanceOptimization();
    initStatusAnnouncement();

    logger.log("✅ TOHI-BOT-HUB custom systems initialized successfully", "CUSTOM");

  } catch (error) {
    logger.log(`❌ Custom system initialization failed: ${error.message}`, "CUSTOM");
  }

  // Graceful shutdown handler
  process.on('SIGINT', () => {
    logger.log("🛑 Graceful shutdown initiated...", "SHUTDOWN");

    // Stop all cron jobs
    cronTasks.forEach(task => task.stop());

    // Save final state
    try {
      const shutdownData = {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        gracefulShutdown: true
      };

      fs.writeFileSync('./utils/shutdown_log.json', JSON.stringify(shutdownData, null, 2));
      logger.log("✓ Final state saved", "SHUTDOWN");

    } catch (error) {
      logger.log(`⚠️ Failed to save final state: ${error.message}`, "SHUTDOWN");
    }

    setTimeout(() => {
      logger.log("👋 TOHI-BOT-HUB shutdown complete", "SHUTDOWN");
      process.exit(0);
    }, 2000);
  });

  return {
    version: "1.8.0",
    author: "TOHI-BOT-HUB",
    description: "Enhanced custom functions for TOHI-BOT-HUB"
  };
};

/**
 * ═══════════════════════════════════════════════════════════
 *                     TOHI-BOT-HUB
 *              © 2024 TOHI-BOT-HUB Team
 *        GitHub: https://github.com/YANDEVA/TOHI-BOT-HUB
 *              Do not remove credits
 * ═══════════════════════════════════════════════════════════
 */