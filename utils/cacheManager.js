
const fs = require('fs');
const path = require('path');

class CacheManager {
  constructor() {
    this.cacheDir = path.join(__dirname, '../modules/commands/cache');
    this.tempFiles = new Set();
    this.cleanupTimer = null;
  }

  // Track a file for auto-deletion
  trackFile(filePath) {
    this.tempFiles.add(filePath);
  }

  // Clean up tracked files
  cleanup() {
    for (const filePath of this.tempFiles) {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Auto-deleted cache file: ${path.basename(filePath)}`);
        }
      } catch (error) {
        console.error(`❌ Error deleting ${filePath}:`, error.message);
      }
    }
    this.tempFiles.clear();
  }

  // Clean up specific file extensions in cache directory
  cleanupByExtension(extensions = ['.jpg', '.png', '.mp4', '.mp3', '.gif', '.pdf', '.aac']) {
    try {
      if (!fs.existsSync(this.cacheDir)) return;
      
      const files = fs.readdirSync(this.cacheDir);
      let deletedCount = 0;
      
      files.forEach(file => {
        const filePath = path.join(this.cacheDir, file);
        const ext = path.extname(file).toLowerCase();
        
        if (extensions.includes(ext)) {
          try {
            const stats = fs.statSync(filePath);
            // Delete files older than 10 minutes
            const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
            
            if (stats.mtime.getTime() < tenMinutesAgo) {
              fs.unlinkSync(filePath);
              deletedCount++;
            }
          } catch (err) {
            console.error(`Error processing ${file}:`, err.message);
          }
        }
      });
      
      if (deletedCount > 0) {
        console.log(`🧹 Auto-cleaned ${deletedCount} old cache files`);
      }
    } catch (error) {
      console.error('❌ Error during cache cleanup:', error.message);
    }
  }

  // Start automatic cleanup timer
  startAutoCleanup(intervalMinutes = 15) {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    this.cleanupTimer = setInterval(() => {
      this.cleanupByExtension();
    }, intervalMinutes * 60 * 1000);
    
    console.log(`✅ Auto cache cleanup started (every ${intervalMinutes} minutes)`);
  }

  // Stop automatic cleanup
  stopAutoCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
      console.log('🔴 Auto cache cleanup stopped');
    }
  }
}

module.exports = new CacheManager();
