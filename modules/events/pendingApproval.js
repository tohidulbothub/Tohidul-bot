
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "pendingApproval",
    eventType: ["message", "log:subscribe"]
  },
  run: async function({ api, event }) {
    const configPath = path.join(__dirname, '../../config.json');
    const config = require(configPath);
    
    // Initialize APPROVAL object if it doesn't exist
    if (!config.APPROVAL) {
      config.APPROVAL = {
        approvedGroups: [],
        pendingGroups: []
      };
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    }

    // If bot is added to a new group
    if (event.type === "log:subscribe" && 
        event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
      
      const threadID = event.threadID;
      
      // Add to pending if not already approved
      if (!config.APPROVAL.approvedGroups.includes(threadID)) {
        if (!config.APPROVAL.pendingGroups.includes(threadID)) {
          config.APPROVAL.pendingGroups.push(threadID);
          fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        }
        
        // Send notification to admin only
        const adminIds = global.config.ADMINBOT || [];
        if (adminIds.length > 0) {
          const threadInfo = await api.getThreadInfo(threadID);
          const msg = `
╔════════════════════════╗
🔔 নতুন গ্রুপে বট এড হয়েছে!
╚════════════════════════╝

📌 গ্রুপ: ${threadInfo.threadName}
🆔 গ্রুপ আইডি: ${threadID}
👥 সদস্য সংখ্যা: ${threadInfo.participantIDs.length}

⚠️ এই গ্রুপে বট এখনো কাজ করবে না।
/approve ${threadID} কমান্ড দিয়ে অনুমোদন করুন।

🚩 Made by TOHIDUL`;

          for (const adminId of adminIds) {
            api.sendMessage(msg, adminId);
          }
        }
        return; // Don't send any message to the group
      }
    }

    // Handle approval command from admin
    if (event.type === "message" && event.body) {
      const args = event.body.trim().split(' ');
      const adminIds = global.config.ADMINBOT || [];
      
      if (args[0] === '/approve' && adminIds.includes(event.senderID)) {
        const targetThreadID = args[1] || event.threadID;
        
        // Check if group is in pending list
        if (config.APPROVAL.pendingGroups.includes(targetThreadID)) {
          // Move from pending to approved
          config.APPROVAL.pendingGroups = config.APPROVAL.pendingGroups.filter(id => id !== targetThreadID);
          config.APPROVAL.approvedGroups.push(targetThreadID);
          
          fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
          
          // Send confirmation to admin
          api.sendMessage(`
╔════════════════════════╗
✅ গ্রুপ অনুমোদিত হয়েছে!
╚════════════════════════╝

🆔 গ্রুপ আইডি: ${targetThreadID}
🤖 বট এখন এই গ্রুপে সক্রিয় হবে।

🚩 Made by TOHIDUL`, event.senderID);

          // Send activation message to the approved group
          const activationMsg = `
╔════════════════════════╗
🤖 বট এখন সক্রিয় হয়েছে!
╚════════════════════════╝

🎉 এই গ্রুপ এখন সফলভাবে অনুমোদিত হয়েছে!
বট এখন সব কমান্ড execute করবে।

📝 /help লিখে সব কমান্ড দেখুন
🎯 Prefix: ${global.config.PREFIX}

┏━━━━━━━━━━━━━━━━━━━┓
┃  Enjoy & Stay Active!
┗━━━━━━━━━━━━━━━━━━━┛

🚩 Made by TOHIDUL`;

          api.sendMessage(activationMsg, targetThreadID);
        } else if (config.APPROVAL.approvedGroups.includes(targetThreadID)) {
          api.sendMessage("⚠️ এই গ্রুপ ইতিমধ্যে অনুমোদিত!", event.senderID);
        } else {
          api.sendMessage("❌ এই গ্রুপ pending তালিকায় নেই!", event.senderID);
        }
      }
    }
  }
};
