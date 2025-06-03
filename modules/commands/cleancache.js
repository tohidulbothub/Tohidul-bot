
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "cleancache",
    version: "1.0.0",
    hasPermssion: 1,
    credits: "TOHI-BOT-HUB",
    description: "Manually clean cache files",
    usePrefix: true,
    commandCategory: "Admin",
    usages: "[all/auto/stop]",
    cooldowns: 5
};

module.exports.run = async ({ api, event, args, cacheManager }) => {
    const { threadID, messageID, senderID } = event;
    const cacheDir = path.join(__dirname, 'cache');
    
    try {
        const action = args[0]?.toLowerCase();
        
        if (action === "auto") {
            const cacheManager = require('../../utils/cacheManager');
            cacheManager.startAutoCleanup(10); // Every 10 minutes
            return api.sendMessage("✅ Auto cache cleanup enabled (every 10 minutes)", threadID, messageID);
        }
        
        if (action === "stop") {
            const cacheManager = require('../../utils/cacheManager');
            cacheManager.stopAutoCleanup();
            return api.sendMessage("🔴 Auto cache cleanup disabled", threadID, messageID);
        }
        
        // Manual cleanup
        if (!fs.existsSync(cacheDir)) {
            return api.sendMessage("📁 Cache directory doesn't exist", threadID, messageID);
        }
        
        const files = fs.readdirSync(cacheDir);
        const mediaExtensions = ['.jpg', '.jpeg', '.png', '.mp4', '.mp3', '.gif', '.pdf', '.aac', '.webm', '.mov'];
        let deletedCount = 0;
        let totalSize = 0;
        
        files.forEach(file => {
            const filePath = path.join(cacheDir, file);
            const ext = path.extname(file).toLowerCase();
            
            if (mediaExtensions.includes(ext) || action === "all") {
                try {
                    const stats = fs.statSync(filePath);
                    totalSize += stats.size;
                    fs.unlinkSync(filePath);
                    deletedCount++;
                } catch (err) {
                    console.error(`Error deleting ${file}:`, err.message);
                }
            }
        });
        
        const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
        
        if (deletedCount > 0) {
            api.sendMessage(
                `🧹 Cache Cleanup Complete!\n` +
                `📁 Files deleted: ${deletedCount}\n` +
                `💾 Space freed: ${sizeInMB} MB\n` +
                `✨ Cache directory cleaned successfully!`,
                threadID, messageID
            );
        } else {
            api.sendMessage("✅ Cache is already clean! No files to delete.", threadID, messageID);
        }
        
    } catch (error) {
        console.error("Cache cleanup error:", error);
        api.sendMessage("❌ Error occurred during cache cleanup: " + error.message, threadID, messageID);
    }
};
