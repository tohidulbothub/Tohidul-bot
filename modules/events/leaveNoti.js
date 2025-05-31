module.exports.config = {
  name: "leave",
  eventType: ["log:unsubscribe"],
  version: "5.0.0",
  credits: "TOHI-BOT-HUB (Complete Remake by TOHIDUL)",
  description: "🎭 New leave notification with specific video and custom Bengali message",
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
    boss: `👑 ${text} 👑`
  };
  return styles[style] || styles.default;
}

// Main function
module.exports.run = async function({ api, event, Users, Threads }) {
  try {
    const { threadID } = event;
    const leftParticipantFbId = event.logMessageData.leftParticipantFbId;

    // Get user info
    const userInfo = {
      id: leftParticipantFbId,
      name: global.data.userName.get(leftParticipantFbId) || await Users.getNameUser(leftParticipantFbId) || "Unknown User"
    };

    // Detect leave type
    const isKicked = event.author !== leftParticipantFbId;

    // Get thread info
    const threadInfo = await api.getThreadInfo(threadID);
    const threadName = threadInfo.threadName || "Unknown Group";
    const remainingMembers = threadInfo.participantIDs.length;

    // Current time in Bangladesh
    const currentTime = new Date().toLocaleString("bn-BD", {
      timeZone: "Asia/Dhaka",
      hour12: false
    });

    // Self leave message
    const selfLeaveMessage = `
╔══════════════════════════════╗
${stylishText("গ্রুপে থাকার যোগ্যতা নেই!", "title")}
╚══════════════════════════════╝

😂 ${userInfo.name} মনে করছে গ্রুপে থাকার যোগ্যতা নেই!
🤡 তাই নিজেই লিভ নিয়ে গেছে!

┌─── 🎭 কিন্তু কিন্তু কিন্তু ───┐
│ 👑 বস আছে তো! 
│ 🔥 ধরে এনে আবার এড করে দিবো!
│ 😎 পালানোর উপায় নেই!
│ 💪 বস এর পাওয়ার দেখবে!
└─────────────────────────────┘

🎪 ${stylishText("যোগ্যতা নেই বলে পালাইছে!", "fire")}
👮‍♂️ ${stylishText("কিন্তু বস ধরে আনবে!", "boss")}

┌─── 📊 গ্রুপের তথ্য ───┐
│ 🏠 গ্রুপ: ${threadName}
│ 👥 বর্তমান সদস্য: ${remainingMembers} জন
│ 🕒 সময়: ${currentTime}
│ 📅 তারিখ: ${new Date().toLocaleDateString('bn-BD')}
└─────────────────────────────┘

💭 ${stylishText("ভাবছে পালিয়ে গেলে বাঁচবে!", "bangla")}
🤣 ${stylishText("কিন্তু বস আছে তো!", "love")}

⋆✦⋆⎯⎯⎯⎯⎯⎯⎯⎯⎯⋆✦⋆
🚩 ${stylishText("TOHIDUL BOSS TEAM", "fire")}
⋆✦⋆⎯⎯⎯⎯⎯⎯⎯⎯⎯⋆✦⋆`;

    // Kicked message
    const kickedMessage = `
╔══════════════════════════════╗
${stylishText("যোগ্যতা নেই তাই কিক!", "title")}
╚══════════════════════════════╝

🦵 ${userInfo.name} কে কিক করা হয়েছে!
😂 কারণ গ্রুপে থাকার যোগ্যতা নেই!

┌─── 🎭 কিন্তু কিন্তু কিন্তু ───┐
│ 👑 বস আছে তো! 
│ 🔥 ধরে এনে আবার এড করে দিবো!
│ 😎 পালানোর উপায় নেই!
│ 💪 বস এর পাওয়ার দেখবে!
│ 🤡 মজা করার জন্য কিক!
└─────────────────────────────┘

🎪 ${stylishText("যোগ্যতা নেই বলে কিক খাইছে!", "fire")}
👮‍♂️ ${stylishText("কিন্তু বস ধরে আনবে!", "boss")}

┌─── 📊 গ্রুপের তথ্য ───┐
│ 🏠 গ্রুপ: ${threadName}
│ 👥 বর্তমান সদস্য: ${remainingMembers} জন
│ 🕒 সময়: ${currentTime}
│ 📅 তারিখ: ${new Date().toLocaleDateString('bn-BD')}
└─────────────────────────────┘

💭 ${stylishText("ভাবছে কিক খেয়ে বাঁচবে!", "bangla")}
🤣 ${stylishText("কিন্তু বস আছে তো!", "love")}

⋆✦⋆⎯⎯⎯⎯⎯⎯⎯⎯⎯⋆✦⋆
🚩 ${stylishText("TOHIDUL BOSS TEAM", "fire")}
⋆✦⋆⎯⎯⎯⎯⎯⎯⎯⎯⎯⋆✦⋆`;

    // Try to send with the specific video
    try {
      const videoPath = path.join(__dirname, 'cache', 'leave', 'Pakad MC Meme Template - Pakad Le BKL Ke Meme - Chodu CID Meme.mp4');

      let attachment = null;

      // Check if video exists
      if (fs.existsSync(videoPath)) {
        try {
          const stats = fs.statSync(videoPath);
          if (stats.size > 1000) { // Check if file has reasonable size
            attachment = fs.createReadStream(videoPath);
            console.log('✅ Leave video attached successfully');
          } else {
            console.log('⚠️ Video file too small, skipping attachment');
          }
        } catch (statError) {
          console.log('❌ Error checking video file stats:', statError.message);
        }
      } else {
        console.log('❌ Video file not found at:', videoPath);
      }

      const messageData = {
        body: isKicked ? kickedMessage : selfLeaveMessage
      };

      if (attachment) {
        messageData.attachment = attachment;
      }

      return api.sendMessage(messageData, threadID);

    } catch (videoError) {
      console.log('Video processing failed:', videoError.message);

      // Send message without video as fallback
      const messageData = {
        body: isKicked ? kickedMessage : selfLeaveMessage
      };

      return api.sendMessage(messageData, threadID);
    }

  } catch (error) {
    console.error('LeaveNoti main error:', error.message);

    // Ultimate fallback message
    try {
      const leftParticipantFbId = event.logMessageData.leftParticipantFbId;
      const name = global.data.userName.get(leftParticipantFbId) || "Unknown User";
      const isKicked = event.author !== leftParticipantFbId;

      const fallbackMessage = `
${stylishText("গ্রুপে থাকার যোগ্যতা নেই!", "title")}

${isKicked ? '🦵' : '🏃‍♂️'} ${name} ${isKicked ? 'কে কিক করা হয়েছে' : 'নিজেই লিভ নিয়ে গেছে'}।

😂 মনে করে গ্রুপে থাকার যোগ্যতা নেই!
👑 কিন্তু বস আছে তো! ধরে এনে আবার এড করে দিবো!

🚩 ${stylishText("TOHIDUL BOSS TEAM", "fire")}`;

      return api.sendMessage(fallbackMessage, event.threadID);

    } catch (fallbackError) {
      console.error('Fallback message failed:', fallbackError.message);
      return;
    }
  }
};