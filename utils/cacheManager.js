const fs = require('fs-extra');
const path = require('path');

class CacheManager {
  constructor() {
    this.cacheDir = path.join(__dirname, '../modules/commands/cache');
    this.tempFiles = new Set();
    this.cleanupTimer = null;
    this.commandFiles = new Map(); // Track files by command
  }

  // Track a file for auto-deletion
  trackFile(filePath, commandName = null) {
    this.tempFiles.add(filePath);
    if (commandName) {
      if (!this.commandFiles.has(commandName)) {
        this.commandFiles.set(commandName, new Set());
      }
      this.commandFiles.get(commandName).add(filePath);
    }
  }

  // Basic cleanup function (non-destructive)
  cleanup() {
    // Simple logging only, no file deletion
    console.log(`🗂️ Cache manager: ${this.tempFiles.size} files tracked`);
  }

  // Basic command cleanup (non-destructive)
  cleanupCommand(commandName) {
    if (this.commandFiles.has(commandName)) {
      const files = this.commandFiles.get(commandName);
      console.log(`🗂️ Command ${commandName} has ${files.size} tracked files`);
      this.commandFiles.delete(commandName);
    }
  }

  // Basic extension cleanup (non-destructive)
  cleanupByExtension(extensions = ['.jpg', '.png', '.mp4', '.mp3', '.gif', '.pdf', '.aac']) {
    try {
      if (!fs.existsSync(this.cacheDir)) return;

      const files = fs.readdirSync(this.cacheDir);
      console.log(`🗂️ Cache directory contains ${files.length} files`);
    } catch (error) {
      console.error('❌ Error during cache check:', error.message);
    }
  }

  // Non-destructive auto cleanup
  autoCleanupAfterCommand(commandName, delaySeconds = 30) {
    setTimeout(() => {
      console.log(`🗂️ Auto cleanup check for command: ${commandName}`);
    }, delaySeconds * 1000);
  }

  // Start automatic cleanup timer (non-destructive)
  startAutoCleanup(intervalMinutes = 15) {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanupByExtension();
    }, intervalMinutes * 60 * 1000);

    console.log(`✅ Auto cache monitor started (every ${intervalMinutes} minutes)`);
  }

  // Stop automatic cleanup
  stopAutoCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
      console.log('🔴 Auto cache monitor stopped');
    }
  }
}

module.exports = new CacheManager();