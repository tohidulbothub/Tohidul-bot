
module.exports.config = {
  name: "leave",
  eventType: ["log:unsubscribe"],
  version: "7.0.0",
  credits: "TOHI-BOT-HUB (Anti-Out Event Integrated by TOHIDUL)",
  description: "🎭 Enhanced leave notification with integrated Anti-Out event system",
  dependencies: {
    "fs-extra": "",
    "path": ""
  }
};

const fs = require('fs-extra');
const path = require('path');

// Stylish text function
function stylishText(text, style = "default") {
  const styles = {
    default: `✨ ${text} ✨`,
    title: `🎭 ${text} 🎭`,
    subtitle: `🌟 ${text} 🌟`,
    warning: `⚠️ ${text} ⚠️`,
    success: `✅ ${text} ✅`,
    error: `❌ ${text} ❌`,
    bangla: `🇧🇩 ${text} 🇧🇩`,
    love: `💖 ${text} 💖`,
    fire: `🔥 ${text} 🔥`,
    boss: `👑 ${text} 👑`,
    antiout: `🛡️ ${text} 🛡️`
  };
  return styles[style] || styles.default;
}

// Handle anti-out event commands
module.exports.handleEvent = async function({ api, event, Threads }) {
  const { body = "", threadID, senderID } = event;
  
  // Check for anti-out toggle commands (case insensitive)
  const lowerBody = body.toLowerCase().trim();
  
  if (lowerBody === "/antiout on" || lowerBody === "antiout on") {
    try {
      // Check if user is bot admin
      const isBotAdmin = global.config.ADMINBOT.includes(senderID.toString());
      
      // Check if user is group admin
      const info = await api.getThreadInfo(threadID);
      const isGroupAdmin = info.adminIDs.some(item => item.id == senderID);
      
      // Permission check - only bot admin or group admin can use
      if (!isBotAdmin && !isGroupAdmin) {
        return api.sendMessage(
          `${stylishText("Access Denied!", "error")}\n\n❌ শুধুমাত্র বট এডমিন বা গ্রুপ এডমিন Anti-Out চালু/বন্ধ করতে পারবেন।\n\n💡 পারমিশনের জন্য এডমিনের সাথে যোগাযোগ করুন।\n\n🚩 Made by TOHIDUL`, 
          threadID
        );
      }

      // Check if bot is group admin
      if (!info.adminIDs.some(item => item.id == api.getCurrentUserID())) {
        return api.sendMessage(
          `${stylishText("Bot Admin Required!", "warning")}\n\n❌ বটকে গ্রুপ এডমিন বানান Anti-Out চালু করার জন্য।\n\n🤖 বট এডমিন না হলে সদস্যদের এড করতে পারবে না।\n\n🚩 Made by TOHIDUL`, 
          threadID
        );
      }

      // Enable anti-out
      const data = (await Threads.getData(threadID)).data || {};
      data["antiout"] = true;
      await Threads.setData(threadID, { data });
      global.data.threadData.set(parseInt(threadID), data);

      const onMessage = `
╔════════════════════════════╗
  🛡️ 𝘼𝙉𝙏𝙄-𝙊𝙐𝙏 𝘼𝘾𝙏𝙄𝙑𝘼𝙏𝙀𝘿 🛡️
╚════════════════════════════╝

┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ✅ Anti-Out সফলভাবে চালু হয়েছে!
┃
┃  🔒 এখন কেউ গ্রুপ ছাড়লে আবার এড করা হবে
┃  💪 পালানোর কোনো উপায় নেই!
┃  🚫 Self-leave সম্পূর্ণ নিষিদ্ধ
┃
┃  ⚠️  **নোট:** বট অবশ্যই এডমিন থাকতে হবে
┃  🛡️  **স্ট্যাটাস:** ACTIVE & MONITORING
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛

🕒 **সময়:** ${new Date().toLocaleString("bn-BD", { timeZone: "Asia/Dhaka", hour12: false })}
🚩 **Made by TOHIDUL**`;

      return api.sendMessage(onMessage, threadID);
      
    } catch (error) {
      console.error('AntiOut ON error:', error);
      return api.sendMessage(
        `${stylishText("System Error!", "error")}\n\n❌ Anti-Out চালু করতে সমস্যা হয়েছে।\n\n🚩 Made by TOHIDUL`, 
        threadID
      );
    }
  }

  if (lowerBody === "/antiout off" || lowerBody === "antiout off") {
    try {
      // Check if user is bot admin
      const isBotAdmin = global.config.ADMINBOT.includes(senderID.toString());
      
      // Check if user is group admin
      const info = await api.getThreadInfo(threadID);
      const isGroupAdmin = info.adminIDs.some(item => item.id == senderID);
      
      // Permission check - only bot admin or group admin can use
      if (!isBotAdmin && !isGroupAdmin) {
        return api.sendMessage(
          `${stylishText("Access Denied!", "error")}\n\n❌ শুধুমাত্র বট এডমিন বা গ্রুপ এডমিন Anti-Out চালু/বন্ধ করতে পারবেন।\n\n💡 পারমিশনের জন্য এডমিনের সাথে যোগাযোগ করুন।\n\n🚩 Made by TOHIDUL`, 
          threadID
        );
      }

      // Disable anti-out
      const data = (await Threads.getData(threadID)).data || {};
      data["antiout"] = false;
      await Threads.setData(threadID, { data });
      global.data.threadData.set(parseInt(threadID), data);

      const offMessage = `
╔════════════════════════════╗
  🔓 𝘼𝙉𝙏𝙄-𝙊𝙐𝙏 𝘿𝙀𝘼𝘾𝙏𝙄𝙑𝘼𝙏𝙀𝘿 🔓
╚════════════════════════════╝

┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ❌ Anti-Out সফলভাবে বন্ধ হয়েছে!
┃
┃  🔓 এখন কেউ চাইলে গ্রুপ ছেড়ে যেতে পারবে
┃  😔 আর ফেরত আনা হবে না
┃  🚪 Normal leave/exit অনুমতি আছে
┃
┃  💡 **পুনরায় চালু করতে:** /antiout on
┃  🛡️ **স্ট্যাটাস:** DISABLED
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛

🕒 **সময়:** ${new Date().toLocaleString("bn-BD", { timeZone: "Asia/Dhaka", hour12: false })}
🚩 **Made by TOHIDUL**`;

      return api.sendMessage(offMessage, threadID);
      
    } catch (error) {
      console.error('AntiOut OFF error:', error);
      return api.sendMessage(
        `${stylishText("System Error!", "error")}\n\n❌ Anti-Out বন্ধ করতে সমস্যা হয়েছে।\n\n🚩 Made by TOHIDUL`, 
        threadID
      );
    }
  }

  // Check for anti-out status command
  if (lowerBody === "/antiout status" || lowerBody === "antiout status" || lowerBody === "/antiout" || lowerBody === "antiout") {
    try {
      const data = (await Threads.getData(threadID)).data || {};
      const isAntiOutEnabled = data.antiout === true;
      
      const statusMessage = `
╔════════════════════════════╗
  🛡️ 𝘼𝙉𝙏𝙄-𝙊𝙐𝙏 𝙎𝙏𝘼𝙏𝙐𝙎 🛡️
╚════════════════════════════╝

🔧 **ব্যবহার:**
   • \`/antiout on\` - Anti-Out চালু করুন
   • \`/antiout off\` - Anti-Out বন্ধ করুন
   • \`/antiout status\` - বর্তমান অবস্থা দেখুন

📊 **বর্তমান অবস্থা:** ${isAntiOutEnabled ? '🟢 চালু' : '🔴 বন্ধ'}

💡 **বৈশিষ্ট্য:**
   • কেউ গ্রুপ ছাড়লে আবার এড করবে
   • শুধু বট/গ্রুপ এডমিন ব্যবহার করতে পারবেন
   • বট অবশ্যই গ্রুপ এডমিন হতে হবে

🚩 **Made by TOHIDUL**`;

      return api.sendMessage(statusMessage, threadID);
      
    } catch (error) {
      console.error('AntiOut STATUS error:', error);
      return api.sendMessage(
        `${stylishText("System Error!", "error")}\n\n❌ Anti-Out স্ট্যাটাস দেখতে সমস্যা হয়েছে।\n\n🚩 Made by TOHIDUL`, 
        threadID
      );
    }
  }
};

// Main leave notification function
module.exports.run = async function({ api, event, Users, Threads }) {
  try {
    const { threadID } = event;
    const leftParticipantFbId = event.logMessageData.leftParticipantFbId;

    // Don't process if bot itself left
    if (leftParticipantFbId == api.getCurrentUserID()) return;

    // Get thread data for anti-out setting
    let data = (await Threads.getData(threadID)).data || {};
    const isAntiOutEnabled = data.antiout === true;

    // Get user info
    const userInfo = {
      id: leftParticipantFbId,
      name: global.data.userName.get(leftParticipantFbId) || await Users.getNameUser(leftParticipantFbId) || "Unknown User"
    };

    // Detect leave type
    const isKicked = event.author !== leftParticipantFbId;
    const isSelfLeave = event.author === leftParticipantFbId;

    // Current time in Bangladesh
    const currentTime = new Date().toLocaleString("bn-BD", {
      timeZone: "Asia/Dhaka",
      hour12: false
    });

    // Handle Anti-Out for self-leave
    if (isSelfLeave && isAntiOutEnabled) {
      // Try to re-add user
      api.addUserToGroup(leftParticipantFbId, threadID, async (error, info) => {
        if (error) {
          console.error(`Failed to re-add user ${leftParticipantFbId}:`, error);
          
          // Send failure message
          const failureMsg = `
${stylishText("গ্রুপে থাকার যোগ্যতা নেই দেখে লিভ দিছিলো!", "fire")}

😂 ${userInfo.name} পালানোর চেষ্টা করেছে কিন্তু ব্যর্থ!
❌ ফেরত আনা যায়নি - হয়তো বটকে ব্লক করেছে।

🚩 Made by TOHIDUL`;

          return api.sendMessage(failureMsg, threadID);
        } else {
          // Send success message with video
          const successMsg = `
${stylishText("গ্রুপে থাকার যোগ্যতা নেই দেখে লিভ দিছিলো, কিন্তু আমি তো আছি—যেতে দিবো না!", "boss")}

😎 ${userInfo.name} পালাতে চেয়েছিলো কিন্তু ধরে আনলাম!
🔒 Anti-Out সিস্টেম কাজ করেছে।

🚩 Made by TOHIDUL`;

          try {
            const videoPath = path.join(__dirname, 'cache', 'leave', 'Pakad MC Meme Template - Pakad Le BKL Ke Meme - Chodu CID Meme.mp4');
            
            let attachment = null;
            if (fs.existsSync(videoPath)) {
              const stats = fs.statSync(videoPath);
              if (stats.size > 1000) {
                attachment = fs.createReadStream(videoPath);
              }
            }

            const messageData = { body: successMsg };
            if (attachment) {
              messageData.attachment = attachment;
            }

            return api.sendMessage(messageData, threadID);
          } catch (videoError) {
            return api.sendMessage(successMsg, threadID);
          }
        }
      });
      return;
    }

    // Handle normal leave notifications when anti-out is OFF or user was kicked
    if (!isAntiOutEnabled || isKicked) {
      let message;
      
      if (isKicked) {
        // User was kicked
        message = `
${stylishText("একজন গ্রুপের সম্মানিত জঘন্য ব্যক্তি কিক খেয়েছে!", "warning")}

🦵 ${userInfo.name} কে কিক করা হয়েছে।
😔 আর থাকতে পারলো না।

🚩 Made by TOHIDUL`;
      } else {
        // Self leave when anti-out is off
        message = `
${stylishText("একজন গ্রুপের সম্মানিত জঘন্য ব্যক্তি লিভ নিয়ে নিলো!", "warning")}

😔 ${userInfo.name} নিজেই গ্রুপ ছেড়ে গেছে।
🔓 Anti-Out বন্ধ থাকায় ফেরত আনা হয়নি।

🚩 Made by TOHIDUL`;
      }

      return api.sendMessage(message, threadID);
    }

  } catch (error) {
    console.error('LeaveNoti integrated error:', error.message);
    
    try {
      const leftParticipantFbId = event.logMessageData.leftParticipantFbId;
      const name = global.data.userName.get(leftParticipantFbId) || "Unknown User";

      const fallbackMessage = `
${stylishText("একজন গ্রুপের সম্মানিত জঘন্য ব্যক্তি লিভ নিয়ে নিলো!", "warning")}

😔 ${name} চলে গেছে।

🚩 Made by TOHIDUL`;

      return api.sendMessage(fallbackMessage, event.threadID);
    } catch (fallbackError) {
      console.error('Fallback message failed:', fallbackError.message);
      return;
    }
  }
};
