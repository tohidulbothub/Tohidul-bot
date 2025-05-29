module.exports.config = {
  name: "approve",
  version: "5.0.0",
  permission: 2,
  usePrefix: true,
  credits: "TOHIDUL (Easy Bangla Edition)",
  description: "Owner approval system — approved ছাড়া কোনো গ্রুপে বট কাজ করবে না।",
  commandCategory: "Admin",
  usages: "/approve [pending|all|status|reject <ID>|<ID>]",
  cooldowns: 5
};

const OWNER_ID = "100092006324917";

module.exports.run = async function ({ api, event, args }) {
  if (event.senderID !== OWNER_ID)
      return api.sendMessage(`⛔️ কেবল owner (${OWNER_ID}) approval দিতে পারবেন!`, event.threadID, event.messageID);

  const { threadID, messageID } = event;
  const { configPath } = global.client;
  const { writeFileSync } = global.nodemodule["fs-extra"];
  delete require.cache[require.resolve(configPath)];
  var config = require(configPath);

  if (!config.APPROVAL)
      config.APPROVAL = { approvedGroups: [], pendingGroups: [], rejectedGroups: [] };
  writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

  const command = (args[0] || "status").toLowerCase();

  // Helper for usage
  const usageMsg =
`📋 Approved System:
- /approve pending : pending লিস্ট দেখুন
- /approve all : সব গ্রুপ লিস্ট
- /approve <ID> : নির্দিষ্ট গ্রুপ চালু
- /approve reject <ID> : বাতিল
- (গ্রুপে /approve দিলে ঐ গ্রুপ চালু হবে)`;

  try {
    switch (command) {
      case "pending": {
        const pendingGroups = config.APPROVAL.pendingGroups || [];
        if (!pendingGroups.length)
            return api.sendMessage("⏳ কোনো pending গ্রুপ নেই!\n"+usageMsg, threadID, messageID);
        let msg = `⏳ Pending গ্রুপ (${pendingGroups.length}):\n`;
        for (let i=0; i<Math.min(pendingGroups.length,10); i++) {
          try {
            const info = await api.getThreadInfo(pendingGroups[i]);
            msg += ` ${i+1}. ${info.threadName}\n    🆔 ${pendingGroups[i]}\n`;
          } catch {
            msg += ` ${i+1}. [তথ্য নেই]\n    🆔 ${pendingGroups[i]}\n`;
          }
        }
        msg += `\nApprove: /approve <ID>\n${usageMsg}`;
        return api.sendMessage(msg, threadID, messageID);
      }
      case "all": {
        const { approvedGroups = [], pendingGroups = [], rejectedGroups = [] } = config.APPROVAL;
        let msg = `✅ Approved: ${approvedGroups.length}\n⏳ Pending: ${pendingGroups.length}\n❌ Rejected: ${rejectedGroups.length}\n\n${usageMsg}`;
        return api.sendMessage(msg, threadID, messageID);
      }
      case "status": {
        const { approvedGroups = [], pendingGroups = [], rejectedGroups = [] } = config.APPROVAL;
        let msg = `✅ Approved: ${approvedGroups.length}\n⏳ Pending: ${pendingGroups.length}\n❌ Rejected: ${rejectedGroups.length}\n\n${usageMsg}`;
        return api.sendMessage(msg, threadID, messageID);
      }
      case "reject": {
        const targetID = args[1];
        if (!targetID)
          return api.sendMessage("❌ ThreadID দিন! যেমন: /approve reject 123456", threadID, messageID);
        if (!config.APPROVAL.rejectedGroups.includes(targetID))
          config.APPROVAL.rejectedGroups.push(targetID);
        config.APPROVAL.pendingGroups = config.APPROVAL.pendingGroups.filter(id => id !== targetID);
        config.APPROVAL.approvedGroups = config.APPROVAL.approvedGroups.filter(id => id !== targetID);
        writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
        api.sendMessage(`❌ গ্রুপ (${targetID}) বাতিল করা হয়েছে!`, threadID, messageID);
        break;
      }
      default: {
        // Approve current group or by ID
        let approveTarget = (args[0] && !isNaN(args[0])) ? args[0] : threadID;
        if (config.APPROVAL.approvedGroups.includes(approveTarget))
            return api.sendMessage("✅ এই গ্রুপ ইতিমধ্যে চালু!", threadID, messageID);
        
        config.APPROVAL.approvedGroups.push(approveTarget);
        config.APPROVAL.pendingGroups = config.APPROVAL.pendingGroups.filter(id => id !== approveTarget);
        config.APPROVAL.rejectedGroups = config.APPROVAL.rejectedGroups.filter(id => id !== approveTarget);
        writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
        
        try {
          const info = await api.getThreadInfo(approveTarget);
          if (approveTarget === threadID) {
            // Current group approval
            api.sendMessage(
`✅ এই গ্রুপ চালু হয়েছে!

নাম: ${info.threadName}
মেম্বার: ${info.participantIDs.length} জন

এখন সব কমান্ড চালু!
/help লিখে দেখুন।`, threadID, messageID);
          } else {
            // Different group approval
            api.sendMessage(
`✅ এই গ্রুপ চালু হয়েছে!

নাম: ${info.threadName}
মেম্বার: ${info.participantIDs.length} জন

এখন সব কমান্ড চালু!
/help লিখে দেখুন।`, approveTarget);
            api.sendMessage(`✅ "${info.threadName}" গ্রুপটি চালু হয়েছে!`, threadID, messageID);
          }
        } catch {
          api.sendMessage(`✅ গ্রুপ চালু হয়েছে!`, threadID, messageID);
        }
        break;
      }
    }
  } catch (error) {
    api.sendMessage("❌ কিছু ভুল হয়েছে! আবার চেষ্টা করুন।", threadID, messageID);
  }
};