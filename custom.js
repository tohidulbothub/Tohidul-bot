
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

module.exports = async ({ api }) => {
  // Enhanced configuration with better defaults
  const config = {
    autoRestart: {
      status: false,
      time: 30, // Restart every 30 minutes for stability
      note: 'Auto-restart helps maintain bot stability and prevents memory leaks',
    },
    acceptPending: {
      status: false,
      time: 15, // Check every 15 minutes
      note: 'Automatically approve pending message requests',
    },
    autoBackup: {
      status: true,
      time: 60, // Backup every hour
      note: 'Automatically backup important data',
    },
    systemHealth: {
      status: true,
      time: 5, // Check every 5 minutes
      note: 'Monitor system health and performance',
    }
  };

  // System startup message
  logger.log("TOHI-BOT-HUB Custom functions initialized", "CUSTOM");
  logger.log(`✓ Auto-restart: ${config.autoRestart.status ? 'Enabled' : 'Disabled'}`, "CUSTOM");
  logger.log(`✓ Pending approval: ${config.acceptPending.status ? 'Enabled' : 'Disabled'}`, "CUSTOM");
  logger.log(`✓ Auto-backup: ${config.autoBackup.status ? 'Enabled' : 'Disabled'}`, "CUSTOM");

  // Enhanced auto-restart function with graceful shutdown
  function initAutoRestart(config) {
    if (!config.status) return;
    
    logger.log(`Auto-restart scheduled every ${config.time} minutes`, "AUTO_RESTART");
    
    cron.schedule(`*/${config.time} * * * *`, () => {
      logger.log("Initiating scheduled system restart...", "AUTO_RESTART");
      logger.log("Saving current state and restarting gracefully", "AUTO_RESTART");
      
      // Save any pending data before restart
      try {
        // Backup current state
        if (global.data && global.client) {
          const backupData = {
            timestamp: new Date().toISOString(),
            commands: global.client.commands.size,
            events: global.client.events.size,
            uptime: process.uptime()
          };
          
          fs.writeFileSync('./utils/restart_backup.json', JSON.stringify(backupData, null, 2));
        }
        
        logger.log("State saved successfully, restarting now...", "AUTO_RESTART");
        
        // Graceful restart
        setTimeout(() => {
          process.exit(1);
        }, 2000);
        
      } catch (error) {
        logger.log(`Restart preparation failed: ${error.message}`, "AUTO_RESTART");
        process.exit(1);
      }
    });
  }

  // Enhanced pending approval with smart filtering
  function initPendingApproval(config) {
    if (!config.status) return;
    
    logger.log(`Pending approval check every ${config.time} minutes`, "PENDING");
    
    cron.schedule(`*/${config.time} * * * *`, async () => {
      try {
        const pendingThreads = [
          ...(await api.getThreadList(10, null, ['PENDING'])),
          ...(await api.getThreadList(10, null, ['OTHER']))
        ];

        if (pendingThreads.length === 0) return;

        logger.log(`Processing ${pendingThreads.length} pending thread(s)`, "PENDING");

        for (const thread of pendingThreads) {
          try {
            // Send welcome message with bot info
            const welcomeMessage = `🤖 Welcome to TOHI-BOT-HUB!\n\n` +
              `✅ Your message request has been approved automatically.\n` +
              `🚀 Type "${global.config.PREFIX || '/'}help" to see available commands.\n` +
              `📞 For support, contact our admin team.\n\n` +
              `💫 Powered by TOHI-BOT-HUB v${global.config.version || '1.8.0'}`;

            await api.sendMessage(welcomeMessage, thread.threadID);
            
            logger.log(`✓ Approved thread: ${thread.threadID}`, "PENDING");
            
            // Add small delay to prevent rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
            
          } catch (error) {
            logger.log(`Failed to approve thread ${thread.threadID}: ${error.message}`, "PENDING");
          }
        }

      } catch (error) {
        logger.log(`Pending approval check failed: ${error.message}`, "PENDING");
      }
    });
  }

  // Auto backup system for important data
  function initAutoBackup(config) {
    if (!config.status) return;
    
    logger.log(`Auto-backup scheduled every ${config.time} minutes`, "BACKUP");
    
    cron.schedule(`*/${config.time} * * * *`, async () => {
      try {
        const backupDir = './backups';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        // Ensure backup directory exists
        await fs.ensureDir(backupDir);
        
        // Create backup data
        const backupData = {
          timestamp: new Date().toISOString(),
          version: global.config.version || '1.8.0',
          botName: global.config.BOTNAME || 'TOHI-BOT',
          uptime: process.uptime(),
          systemStats: {
            commandsLoaded: global.client?.commands?.size || 0,
            eventsLoaded: global.client?.events?.size || 0,
            memoryUsage: process.memoryUsage(),
            nodeVersion: process.version
          },
          config: {
            prefix: global.config.PREFIX,
            adminBot: global.config.ADMINBOT,
            language: global.config.language
          }
        };

        // Save backup files
        const backupFile = `${backupDir}/backup_${timestamp}.json`;
        await fs.writeFile(backupFile, JSON.stringify(backupData, null, 2));
        
        // Keep only last 24 backups (1 day if hourly)
        const backupFiles = await fs.readdir(backupDir);
        const sortedBackups = backupFiles
          .filter(file => file.startsWith('backup_') && file.endsWith('.json'))
          .sort()
          .reverse();

        // Remove old backups
        if (sortedBackups.length > 24) {
          for (const oldBackup of sortedBackups.slice(24)) {
            await fs.remove(`${backupDir}/${oldBackup}`);
          }
        }

        logger.log(`✓ System backup completed: ${backupFile}`, "BACKUP");
        
      } catch (error) {
        logger.log(`Auto-backup failed: ${error.message}`, "BACKUP");
      }
    });
  }

  // System health monitoring
  function initSystemHealth(config) {
    if (!config.status) return;
    
    logger.log(`System health monitoring every ${config.time} minutes`, "HEALTH");
    
    cron.schedule(`*/${config.time} * * * *`, async () => {
      try {
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        const uptime = process.uptime();
        
        // Memory usage check (alert if over 1GB)
        const memUsageMB = memUsage.heapUsed / 1024 / 1024;
        if (memUsageMB > 1024) {
          logger.log(`⚠️ High memory usage detected: ${memUsageMB.toFixed(2)}MB`, "HEALTH");
        }
        
        // Uptime check
        const uptimeHours = uptime / 3600;
        if (uptimeHours > 24) {
          logger.log(`ℹ️ Bot has been running for ${uptimeHours.toFixed(1)} hours`, "HEALTH");
        }
        
        // Connection check
        if (global.client?.api) {
          try {
            await global.client.api.getCurrentUserID();
            logger.log("✓ API connection healthy", "HEALTH");
          } catch (error) {
            logger.log(`⚠️ API connection issue: ${error.message}`, "HEALTH");
          }
        }
        
      } catch (error) {
        logger.log(`Health check failed: ${error.message}`, "HEALTH");
      }
    });
  }

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
    initAutoRestart(config.autoRestart);
    initPendingApproval(config.acceptPending);
    initAutoBackup(config.autoBackup);
    initSystemHealth(config.systemHealth);
    initErrorRecovery();
    initPerformanceOptimization();
    initStatusAnnouncement();
    
    logger.log("✅ All TOHI-BOT-HUB custom systems initialized successfully", "CUSTOM");
    
  } catch (error) {
    logger.log(`❌ Custom system initialization failed: ${error.message}`, "CUSTOM");
  }

  // Graceful shutdown handler
  process.on('SIGINT', () => {
    logger.log("🛑 Graceful shutdown initiated...", "SHUTDOWN");
    
    // Stop all cron jobs
    cron.getTasks().forEach(task => task.stop());
    
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
    config,
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
