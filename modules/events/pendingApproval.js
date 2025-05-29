
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "pendingApproval",
    eventType: ["message", "log:subscribe"],
    version: "3.0.0",
    credits: "TOHIDUL (Enhanced by TOHI-BOT-HUB)",
    description: "Manual approval system - নতুন গ্রুপে notification এবং manual approval"
  },
  run: async function({ api, event }) {
    try {
      const configPath = path.join(__dirname, '../../config.json');
      const config = require(configPath);

      // Specific owner who can approve
      const OWNER_ID = "100092006324917";

      // Initialize APPROVAL system
      if (!config.APPROVAL) {
        config.APPROVAL = {
          approvedGroups: [],
          pendingGroups: [],
          rejectedGroups: []
        };
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      }

      // Turn off AUTO_APPROVE
      if (!config.AUTO_APPROVE) {
        config.AUTO_APPROVE = {
          enabled: false,
          approvedGroups: [],
          autoApproveMessage: false
        };
      } else {
        config.AUTO_APPROVE.enabled = false;
      }
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      // If bot is added to a new group
      if (event.type === "log:subscribe" && 
          event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {

        const threadID = event.threadID;

        // Check if already approved/rejected/pending
        if (config.APPROVAL.approvedGroups.includes(threadID)) {
          return; // Already approved
        }

        if (config.APPROVAL.rejectedGroups && config.APPROVAL.rejectedGroups.includes(threadID)) {
          return; // Already rejected
        }

        // Add to pending list if not already there
        if (!config.APPROVAL.pendingGroups.includes(threadID)) {
          config.APPROVAL.pendingGroups.push(threadID);
          fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        }

        try {
          const threadInfo = await api.getThreadInfo(threadID);
          const currentTime = new Date().toLocaleString("bn-BD", {
            timeZone: "Asia/Dhaka",
            hour12: false
          });

          // Send notification to the specific owner
          const approvalRequestMsg = `
╔════════════════════════════╗
  🔔 𝗡𝗘𝗪 𝗚𝗥𝗢𝗨𝗣 𝗔𝗗𝗗𝗘𝗗 🔔
╚════════════════════════════╝

🤖 বট নতুন গ্রুপে যুক্ত হয়েছে!

📊 গ্রুপ তথ্য:
┣━ নাম: ${threadInfo.threadName}
┣━ আইডি: ${threadID}
┣━ সদস্য: ${threadInfo.participantIDs.length} জন
┣━ সময়: ${currentTime}
┗━ স্ট্যাটাস: Approval এর অপেক্ষায় ⏳

❓ এই গ্রুপ approve করবেন?

🎯 Reply করুন:
┣━ "yes" বা "approve" - Approve করতে
┗━ "no" বা "reject" - Reject করতে

⚠️ Approve না করা পর্যন্ত এই গ্রুপে কমান্ড কাজ করবে না!

────────────✦────────────
🚩 Made by TOHIDUL
────────────✦────────────`;

          api.sendMessage(approvalRequestMsg, OWNER_ID, (error, info) => {
            if (!error) {
              global.client.handleReply.push({
                name: this.config.name,
                messageID: info.messageID,
                author: OWNER_ID,
                threadID: threadID,
                type: "approval"
              });
            }
          });

          // Send message to the group about pending approval
          const pendingMsg = `
╔════════════════════════════╗
  ⏳ 𝗔𝗣𝗣𝗥𝗢𝗩𝗔𝗟 𝗣𝗘𝗡𝗗𝗜𝗡𝗚 ⏳
╚════════════════════════════╝

🤖 ${global.config.BOTNAME || 'TOHI-BOT'} যুক্ত হয়েছে!

⚠️ কিন্তু এই গ্রুপ এখনো approve হয়নি।

📋 Approval এর অপেক্ষায়:
┣━ Admin এর কাছে notification পাঠানো হয়েছে
┣━ Approval পেলে সব কমান্ড কাজ করবে
┣━ Approval না পেলে কমান্ড কাজ করবে না
┗━ ধৈর্য ধরে অপেক্ষা করুন

🎯 Approval পেলে আপনি notification পাবেন!

────────────✦────────────
🚩 Made by TOHIDUL
────────────✦────────────`;

          setTimeout(() => {
            api.sendMessage(pendingMsg, threadID);
          }, 2000);

        } catch (error) {
          console.error('Error in pendingApproval:', error);
        }
      }
    } catch (error) {
      console.error('PendingApproval Error:', error);
    }
  },

  handleReply: async function ({ api, event, handleReply }) {
    const OWNER_ID = "100092006324917";
    
    if (event.senderID !== OWNER_ID) {
      return api.sendMessage(`⛔️ শুধুমাত্র নির্দিষ্ট admin (${OWNER_ID}) approval দিতে পারবেন!`, event.threadID);
    }

    const { configPath } = global.client;
    const { writeFileSync } = global.nodemodule["fs-extra"];
    delete require.cache[require.resolve(configPath)];
    var config = require(configPath);

    const threadID = handleReply.threadID;
    const choice = event.body.toLowerCase().trim();

    if (choice === "yes" || choice === "y" || choice === "approve" || choice === "হ্যাঁ") {
      // Approve the group
      if (!config.APPROVAL.approvedGroups.includes(threadID)) {
        config.APPROVAL.approvedGroups.push(threadID);
      }

      // Remove from pending
      if (config.APPROVAL.pendingGroups && config.APPROVAL.pendingGroups.includes(threadID)) {
        config.APPROVAL.pendingGroups = config.APPROVAL.pendingGroups.filter(id => id !== threadID);
      }

      writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

      try {
        const threadInfo = await api.getThreadInfo(threadID);
        const approvalMsg = `
╔════════════════════════════╗
  ✅ 𝗚𝗥𝗢𝗨𝗣 𝗔𝗣𝗣𝗥𝗢𝗩𝗘𝗗 ✅
╚════════════════════════════╝

🎉 আপনার গ্রুপ অনুমোদিত হয়েছে!

📊 গ্রুপ তথ্য:
┣━ নাম: ${threadInfo.threadName}
┣━ সদস্য: ${threadInfo.participantIDs.length} জন
┣━ স্ট্যাটাস: সক্রিয় ✅

🚀 এখন সব কমান্ড কাজ করবে:
┣━ ${global.config.PREFIX}help - সব কমান্ড
┣━ ${global.config.PREFIX}menu - মেনু
┣━ ${global.config.PREFIX}info - বট তথ্য
┗━ ${global.config.PREFIX}admin - এডমিন

────────────✦────────────
🚩 Made by TOHIDUL
────────────✦────────────`;

        api.sendMessage(approvalMsg, threadID);
        api.sendMessage(`✅ গ্রুপ "${threadInfo.threadName}" সফলভাবে approve করা হয়েছে!`, event.threadID, event.messageID);
      } catch (error) {
        api.sendMessage(`✅ গ্রুপ approve করা হয়েছে!`, event.threadID, event.messageID);
      }

    } else if (choice === "no" || choice === "n" || choice === "reject" || choice === "না") {
      // Reject the group
      if (!config.APPROVAL.rejectedGroups) {
        config.APPROVAL.rejectedGroups = [];
      }

      if (!config.APPROVAL.rejectedGroups.includes(threadID)) {
        config.APPROVAL.rejectedGroups.push(threadID);
      }

      // Remove from pending
      if (config.APPROVAL.pendingGroups && config.APPROVAL.pendingGroups.includes(threadID)) {
        config.APPROVAL.pendingGroups = config.APPROVAL.pendingGroups.filter(id => id !== threadID);
      }

      writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

      try {
        const threadInfo = await api.getThreadInfo(threadID);
        api.sendMessage(`❌ গ্রুপ "${threadInfo.threadName}" reject করা হয়েছে!`, event.threadID, event.messageID);
      } catch (error) {
        api.sendMessage(`❌ গ্রুপ reject করা হয়েছে!`, event.threadID, event.messageID);
      }
    } else {
      api.sendMessage(`❓ অবৈধ উত্তর! "yes" বা "no" লিখুন।`, event.threadID, event.messageID);
    }
  }
};
