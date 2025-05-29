const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "pendingApproval",
    eventType: ["message", "log:subscribe"],
    version: "2.0.0",
    credits: "TOHIDUL (Enhanced by TOHI-BOT-HUB)",
    description: "Auto-approve system for groups with instant activation"
  },
  run: async function({ api, event }) {
    try {
      const configPath = path.join(__dirname, '../../config.json');
      const config = require(configPath);

      // Initialize AUTO_APPROVE object if it doesn't exist
      if (!config.AUTO_APPROVE) {
        config.AUTO_APPROVE = {
          enabled: true,
          approvedGroups: [],
          autoApproveMessage: true
        };
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      }

      // If bot is added to a new group
      if (event.type === "log:subscribe" && 
          event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {

        const threadID = event.threadID;

        // Check if auto-approve is enabled
        if (config.AUTO_APPROVE.enabled) {
          // Auto-approve the group instantly
          if (!config.AUTO_APPROVE.approvedGroups.includes(threadID)) {
            config.AUTO_APPROVE.approvedGroups.push(threadID);
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
          }

          // Send auto-approval notification to admin
          const adminIds = global.config.ADMINBOT || [];
          if (adminIds.length > 0) {
            try {
              const threadInfo = await api.getThreadInfo(threadID);
              const currentTime = new Date().toLocaleString("bn-BD", {
                timeZone: "Asia/Dhaka",
                hour12: false
              });

              const adminNotificationMsg = `
╔════════════════════════════╗
  🎊 𝗔𝗨𝗧𝗢 𝗔𝗣𝗣𝗥𝗢𝗩𝗘𝗗 🎊
╚════════════════════════════╝

🤖 বট নতুন গ্রুপে যুক্ত হয়েছে এবং অটো এপ্রুভ করা হয়েছে!

📊 গ্রুপ তথ্য:
┣━ নাম: ${threadInfo.threadName}
┣━ আইডি: ${threadID}
┣━ সদস্য: ${threadInfo.participantIDs.length} জন
┣━ সময়: ${currentTime}
┗━ স্ট্যাটাস: তাৎক্ষণিক সক্রিয় ✅

🎯 বট এখনই এই গ্রুপে সম্পূর্ণ সক্রিয় এবং সব কমান্ড কাজ করবে!

📋 অটো এপ্রুভ সিস্টেম চালু আছে।
⚙️ বন্ধ করতে: /approve off

────────────✦────────────
🚩 Made by TOHIDUL
────────────✦────────────`;

              for (const adminId of adminIds) {
                try {
                  await api.sendMessage(adminNotificationMsg, adminId);
                } catch (adminMsgError) {
                  console.error(`Failed to send admin notification to ${adminId}:`, adminMsgError);
                }
              }
            } catch (threadInfoError) {
              console.error('Error getting thread info for auto approval:', threadInfoError);
            }
          }

          // Send instant activation message to the group
          if (config.AUTO_APPROVE.autoApproveMessage) {
            try {
              const threadInfo = await api.getThreadInfo(threadID);
              const currentTime = new Date().toLocaleString("bn-BD", {
                timeZone: "Asia/Dhaka",
                hour12: false
              });

              const activationMsg = `
╔════════════════════════════╗
  🎊 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗧𝗢 𝗧𝗢𝗛𝗜-𝗕𝗢𝗧 🎊
╚════════════════════════════╝

🤖 ${global.config.BOTNAME || 'TOHI-BOT'} এখন সক্রিয়!

🎉 এই গ্রুপ স্বয়ংক্রিয়ভাবে অনুমোদিত হয়েছে!
✨ সব কমান্ড এখনই কাজ করবে।

🚀 শুরু করতে:
┣━ ${global.config.PREFIX}help - সব কমান্ড দেখুন
┣━ ${global.config.PREFIX}menu - ক্যাটাগরি মেনু
┣━ ${global.config.PREFIX}info - বট তথ্য
┗━ ${global.config.PREFIX}admin - এডমিন তালিকা

📊 গ্রুপ তথ্য:
┣━ গ্রুপ: ${threadInfo.threadName}
┣━ সদস্য: ${threadInfo.participantIDs.length} জন
┣━ প্রিফিক্স: ${global.config.PREFIX}
┣━ যুক্ত হওয়ার সময়: ${currentTime}
┗━ স্ট্যাটাস: তাৎক্ষণিক সক্রিয় ✅

🎯 অটো এপ্রুভ সিস্টেম দ্বারা তাৎক্ষণিক অনুমোদিত!

────────────✦────────────
🚩 Made by TOHIDUL
────────────✦────────────`;

              setTimeout(() => {
                api.sendMessage(activationMsg, threadID);
              }, 2000); // 2 second delay for better UX
            } catch (activationError) {
              console.error('Error sending activation message:', activationError);
            }
          }
        } else {
          // Manual approval system (original behavior)
          if (!config.APPROVAL) {
            config.APPROVAL = {
              approvedGroups: [],
              pendingGroups: [],
              rejectedGroups: []
            };
          }

          if (!config.APPROVAL.approvedGroups.includes(threadID)) {
            if (!config.APPROVAL.pendingGroups.includes(threadID)) {
              config.APPROVAL.pendingGroups.push(threadID);
              fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            }

            // Send manual approval notification to admin
            const adminIds = global.config.ADMINBOT || [];
            if (adminIds.length > 0) {
              try {
                const threadInfo = await api.getThreadInfo(threadID);
                const currentTime = new Date().toLocaleString("bn-BD", {
                  timeZone: "Asia/Dhaka",
                  hour12: false
                });

                const adminNotificationMsg = `
╔════════════════════════════╗
  🔔 𝗠𝗔𝗡𝗨𝗔𝗟 𝗔𝗣𝗣𝗥𝗢𝗩𝗔𝗟 🔔
╚════════════════════════════╝

🤖 বট নতুন গ্রুপে যুক্ত হয়েছে!

📊 গ্রুপ তথ্য:
┣━ নাম: ${threadInfo.threadName}
┣━ আইডি: ${threadID}
┣━ সদস্য: ${threadInfo.participantIDs.length} জন
┣━ সময়: ${currentTime}
┗━ স্ট্যাটাস: ম্যানুয়াল এপ্রুভালের অপেক্ষায়

⚠️ অটো এপ্রুভ বন্ধ আছে, ম্যানুয়াল এপ্রুভাল প্রয়োজন।

🎯 অনুমোদনের জন্য:
┣━ /approve on - অটো এপ্রুভ চালু করুন
┗━ অথবা ম্যানুয়াল এপ্রুভাল করুন

────────────✦────────────
🚩 Made by TOHIDUL
────────────✦────────────`;

                for (const adminId of adminIds) {
                  try {
                    await api.sendMessage(adminNotificationMsg, adminId);
                  } catch (adminMsgError) {
                    console.error(`Failed to send admin notification to ${adminId}:`, adminMsgError);
                  }
                }
              } catch (threadInfoError) {
                console.error('Error getting thread info for manual approval:', threadInfoError);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('PendingApproval Error:', error);
    }
  }
};