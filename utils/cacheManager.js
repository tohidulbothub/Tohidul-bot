
const fs = require('fs-extra');
const path = require('path');

class CacheManager {
  constructor() {
    this.cacheDir = path.join(__dirname, '../modules/commands/cache');
  }

  // Basic method to ensure cache directory exists
  ensureCacheDir() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.ensureDirSync(this.cacheDir);
    }
  }
}

module.exports = new CacheManager();
