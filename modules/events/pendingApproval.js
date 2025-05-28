
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "pendingApproval",
    eventType: ["message", "log:subscribe"],
    version: "1.1.0",
    credits: "TOHIDUL (Enhanced by TOHI-BOT-HUB)",
    description: "Enhanced group approval system with detailed notifications"
  },
  run: async function({ api, event }) {
    try {
      const configPath = path.join(__dirname, '../../config.json');
      const config = require(configPath);
      
      // Initialize APPROVAL object if it doesn't exist
      if (!config.APPROVAL) {
        config.APPROVAL = {
          approvedGroups: [],
          pendingGroups: [],
          rejectedGroups: []
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
            try {
              const threadInfo = await api.getThreadInfo(threadID);
              const currentTime = new Date().toLocaleString("bn-BD", {
                timeZone: "Asia/Dhaka",
                hour12: false
              });
              
              const adminNotificationMsg = `
╔════════════════════════════╗
  🔔 𝗡𝗘𝗪 𝗚𝗥𝗢𝗨𝗣 𝗣𝗘𝗡𝗗𝗜𝗡𝗚 🔔
╚════════════════════════════╝

🤖 বট নতুন গ্রুপে যুক্ত হয়েছে!

📊 গ্রুপ তথ্য:
┣━ নাম: ${threadInfo.threadName}
┣━ আইডি: ${threadID}
┣━ সদস্য: ${threadInfo.participantIDs.length} জন
┣━ সময়: ${currentTime}
┗━ স্ট্যাটাস: অনুমোদনের অপেক্ষায়

⚠️ এই গ্রুপে বট এখনো সক্রিয় নয়।

🎯 অনুমোদনের জন্য:
┣━ /approve ${threadID} - এই গ্রুপ অনুমোদন
┣━ /reject ${threadID} - এই গ্রুপ প্রত্যাখ্যান
┣━ /pending - সব পেন্ডিং গ্রুপ দেখুন
┗━ /approved - অনুমোদিত গ্রুপ দেখুন

📋 দ্রুত অনুমোদন: /approve ${threadID}

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
              console.error('Error getting thread info for pending approval:', threadInfoError);
            }
          }
          return; // Don't send any message to the group
        }
      }

      // Handle approval/rejection commands from admin
      if (event.type === "message" && event.body) {
        const args = event.body.trim().split(' ');
        const command = args[0].toLowerCase();
        const adminIds = global.config.ADMINBOT || [];
        
        if (!adminIds.includes(event.senderID)) return;

        const currentTime = new Date().toLocaleString("bn-BD", {
          timeZone: "Asia/Dhaka",
          hour12: false
        });

        switch (command) {
          case '/approve':
            const approveThreadID = args[1] || event.threadID;
            
            if (config.APPROVAL.pendingGroups.includes(approveThreadID)) {
              // Move from pending to approved
              config.APPROVAL.pendingGroups = config.APPROVAL.pendingGroups.filter(id => id !== approveThreadID);
              config.APPROVAL.approvedGroups.push(approveThreadID);
              
              fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
              
              // Send confirmation to admin
              const approvalConfirmMsg = `
╔════════════════════════════╗
  ✅ 𝗚𝗥𝗢𝗨𝗣 𝗔𝗣𝗣𝗥𝗢𝗩𝗘𝗗 ✅
╚════════════════════════════╝

🎉 গ্রুপ সফলভাবে অনুমোদিত হয়েছে!

📊 তথ্য:
┣━ গ্রুপ আইডি: ${approveThreadID}
┣━ অনুমোদনের সময়: ${currentTime}
┣━ স্ট্যাটাস: সক্রিয় ✅
┗━ বট কমান্ড: এখন কার্যকর

🤖 বট এখন এই গ্রুপে সম্পূর্ণ সক্রিয়!

────────────✦────────────
🚩 Made by TOHIDUL
────────────✦────────────`;

              api.sendMessage(approvalConfirmMsg, event.senderID);

              // Send activation message to the approved group
              try {
                const threadInfo = await api.getThreadInfo(approveThreadID);
                const activationMsg = `
╔════════════════════════════╗
  🎊 𝗕𝗢𝗧 𝗔𝗖𝗧𝗜𝗩𝗔𝗧𝗘𝗗 🎊
╚════════════════════════════╝

🤖 ${global.config.BOTNAME || 'TOHI-BOT'} এখন সক্রিয়!

🎉 এই গ্রুপ সফলভাবে অনুমোদিত হয়েছে!
✨ সব কমান্ড এখন কাজ করবে।

🚀 শুরু করতে:
┣━ ${global.config.PREFIX}help - সব কমান্ড দেখুন
┣━ ${global.config.PREFIX}menu - ক্যাটাগরি মেনু
┣━ ${global.config.PREFIX}info - বট তথ্য
┗━ ${global.config.PREFIX}admin - এডমিন তালিকা

📊 গ্রুপ তথ্য:
┣━ গ্রুপ: ${threadInfo.threadName}
┣━ সদস্য: ${threadInfo.participantIDs.length} জন
┣━ প্রিফিক্স: ${global.config.PREFIX}
┗━ অনুমোদনের সময়: ${currentTime}

🎯 নিয়মাবলী মেনে চলুন এবং উপভোগ করুন!

────────────✦────────────
🚩 Made by TOHIDUL
────────────✦────────────`;

                api.sendMessage(activationMsg, approveThreadID);
              } catch (activationError) {
                console.error('Error sending activation message:', activationError);
              }

            } else if (config.APPROVAL.approvedGroups.includes(approveThreadID)) {
              api.sendMessage("⚠️ এই গ্রুপ ইতিমধ্যে অনুমোদিত!", event.senderID);
            } else {
              api.sendMessage("❌ এই গ্রুপ পেন্ডিং তালিকায় নেই!", event.senderID);
            }
            break;

          case '/reject':
            const rejectThreadID = args[1] || event.threadID;
            
            if (config.APPROVAL.pendingGroups.includes(rejectThreadID)) {
              // Move from pending to rejected
              config.APPROVAL.pendingGroups = config.APPROVAL.pendingGroups.filter(id => id !== rejectThreadID);
              if (!config.APPROVAL.rejectedGroups) config.APPROVAL.rejectedGroups = [];
              config.APPROVAL.rejectedGroups.push(rejectThreadID);
              
              fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
              
              const rejectionMsg = `
╔════════════════════════════╗
  ❌ 𝗚𝗥𝗢𝗨𝗣 𝗥𝗘𝗝𝗘𝗖𝗧𝗘𝗗 ❌
╚════════════════════════════╝

🚫 গ্রুপ প্রত্যাখ্যান করা হয়েছে।

📊 তথ্য:
┣━ গ্রুপ আইডি: ${rejectThreadID}
┣━ প্রত্যাখ্যানের সময়: ${currentTime}
┣━ স্ট্যাটাস: প্রত্যাখ্যাত ❌
┗━ বট কমান্ড: নিষ্ক্রিয়

⚠️ এই গ্রুপে বট কাজ করবে না।

────────────✦────────────
🚩 Made by TOHIDUL
────────────✦────────────`;

              api.sendMessage(rejectionMsg, event.senderID);
            } else {
              api.sendMessage("❌ এই গ্রুপ পেন্ডিং তালিকায় নেই!", event.senderID);
            }
            break;

          case '/pending':
            const pendingGroups = config.APPROVAL.pendingGroups || [];
            if (pendingGroups.length === 0) {
              api.sendMessage("✅ কোনো গ্রুপ পেন্ডিং নেই!", event.senderID);
            } else {
              let pendingMsg = `
╔════════════════════════════╗
  📋 𝗣𝗘𝗡𝗗𝗜𝗡𝗚 𝗚𝗥𝗢𝗨𝗣𝗦 📋
╚════════════════════════════╝

🔄 অনুমোদনের অপেক্ষায় রয়েছে: ${pendingGroups.length} টি গ্রুপ

`;
              for (let i = 0; i < pendingGroups.length; i++) {
                try {
                  const threadInfo = await api.getThreadInfo(pendingGroups[i]);
                  pendingMsg += `${i + 1}. ${threadInfo.threadName}\n   ID: ${pendingGroups[i]}\n   সদস্য: ${threadInfo.participantIDs.length} জন\n\n`;
                } catch {
                  pendingMsg += `${i + 1}. Unknown Group\n   ID: ${pendingGroups[i]}\n\n`;
                }
              }
              
              pendingMsg += `────────────✦────────────\n🚩 Made by TOHIDUL\n────────────✦────────────`;
              api.sendMessage(pendingMsg, event.senderID);
            }
            break;

          case '/approved':
            const approvedGroups = config.APPROVAL.approvedGroups || [];
            if (approvedGroups.length === 0) {
              api.sendMessage("❌ কোনো গ্রুপ অনুমোদিত নেই!", event.senderID);
            } else {
              let approvedMsg = `
╔════════════════════════════╗
  ✅ 𝗔𝗣𝗣𝗥𝗢𝗩𝗘𝗗 𝗚𝗥𝗢𝗨𝗣𝗦 ✅
╚════════════════════════════╝

🎉 অনুমোদিত গ্রুপ: ${approvedGroups.length} টি

`;
              for (let i = 0; i < Math.min(approvedGroups.length, 10); i++) {
                try {
                  const threadInfo = await api.getThreadInfo(approvedGroups[i]);
                  approvedMsg += `${i + 1}. ${threadInfo.threadName}\n   ID: ${approvedGroups[i]}\n   সদস্য: ${threadInfo.participantIDs.length} জন\n\n`;
                } catch {
                  approvedMsg += `${i + 1}. Unknown Group\n   ID: ${approvedGroups[i]}\n\n`;
                }
              }
              
              if (approvedGroups.length > 10) {
                approvedMsg += `... এবং আরো ${approvedGroups.length - 10} টি গ্রুপ\n\n`;
              }
              
              approvedMsg += `────────────✦────────────\n🚩 Made by TOHIDUL\n────────────✦────────────`;
              api.sendMessage(approvedMsg, event.senderID);
            }
            break;
        }
      }
    } catch (error) {
      console.error('PendingApproval Error:', error);
    }
  }
};
