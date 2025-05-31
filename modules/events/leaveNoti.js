
module.exports.config = {
  name: "leave",
  eventType: ["log:unsubscribe"],
  version: "2.0.0",
  credits: "TOHI-BOT-HUB (Enhanced by TOHIDUL)",
  description: "Enhanced stylish notification when someone leaves or is kicked from the group",
  dependencies: {
    "fs-extra": "",
    "path": "",
    "canvas": "",
    "axios": ""
  }
};

const { apiCallWithRetry } = require("../../utils/apiHelper");
const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs-extra');
const path = require('path');

let backgrounds = [
  "https://i.imgur.com/MnAwD8U.jpg",
  "https://i.imgur.com/tSkuyIu.jpg", 
  "https://i.imgur.com/dDSh0wc.jpeg",
  "https://i.imgur.com/UucSRWJ.jpeg",
  "https://i.imgur.com/VQXViKI.png"
];

let fontlink = 'https://drive.google.com/u/0/uc?id=1ZwFqYB-x6S9MjPfYm3t3SP1joohGl4iw&export=download';

module.exports.run = async function({ api, event, Users, Threads }) {
  try {
    // Ensure cache/leave exists
    const cacheLeaveDir = path.join(__dirname, "cache", "leave");
    if (!fs.existsSync(cacheLeaveDir)) fs.mkdirSync(cacheLeaveDir, { recursive: true });

    const leftParticipantFbId = event.logMessageData.leftParticipantFbId;
    const name = global.data.userName.get(leftParticipantFbId) || await Users.getNameUser(leftParticipantFbId);

    // Detect leave type
    const isSelfLeave = event.author == leftParticipantFbId;
    const currentTime = new Date().toLocaleString("bn-BD", {
      timeZone: "Asia/Dhaka",
      hour12: false
    });

    // Get thread info
    const threadInfo = await api.getThreadInfo(event.threadID);
    const threadName = threadInfo.threadName || "Unknown Group";
    const remainingMembers = threadInfo.participantIDs.length;

    // Enhanced message for self-leave
    const leaveSelfMsg = `
╔══════════════════════════════╗
    😊 ${stylishText("SELF LEAVE DETECTED")} 😊
╚══════════════════════════════╝

👋 ${name} নিজেই গ্রুপ ছেড়ে চলে গেছেন!

┌─── 💭 সম্ভাব্য কারণ ───┐
│ 🕐 ব্যস্ততার কারণে
│ ⏰ গ্রুপে সময় দিতে পারছেন না  
│ 🤔 ব্যক্তিগত কোনো কারণে
│ 😅 অথবা হয়তো ভুলে গেছেন আমাদের!
└─────────────────────────────┘

┌─── 📊 গ্রুপ আপডেট ───┐
│ 🏠 গ্রুপ: ${threadName}
│ 👥 অবশিষ্ট সদস্য: ${remainingMembers} জন
│ 🕒 সময়: ${currentTime}
│ 📅 আজকের তারিখ: ${new Date().toLocaleDateString('bn-BD')}
└─────────────────────────────┘

🌟 ${name}, আপনার অনুপস্থিতি আমরা অনুভব করবো!
💝 যেকোনো সময় ফিরে আসতে পারেন।
🤲 আল্লাহ হাফেজ!

⋆✦⋆⎯⎯⎯⎯⎯⎯⎯⎯⎯⋆✦⋆
🚩 𝙏𝙊𝙃𝙄-𝘽𝙊𝙏 𝙏𝙀𝘼𝙈
⋆✦⋆⎯⎯⎯⎯⎯⎯⎯⎯⎯⋆✦⋆`;

    // Enhanced message for admin kick
    const leaveKickMsg = `
╔══════════════════════════════╗
    👮‍♂️ ${stylishText("ADMIN ACTION TAKEN")} 👮‍♂️
╚══════════════════════════════╝

⚡ ${name} কে গ্রুপ থেকে রিমুভ করা হয়েছে!

┌─── 🎯 সম্ভাব্য কারণ ───┐
│ ⚖️ গ্রুপ নিয়ম ভঙ্গ
│ 😠 অনুপযুক্ত আচরণ
│ 📱 স্প্যামিং বা বিজ্ঞাপন
│ 🚫 গ্রুপের সাথে মানানসই নয়
│ 👥 এডমিনের সিদ্ধান্ত
└─────────────────────────────┘

┌─── 📊 গ্রুপ আপডেট ───┐
│ 🏠 গ্রুপ: ${threadName}
│ 👥 অবশিষ্ট সদস্য: ${remainingMembers} জন
│ 🕒 সময়: ${currentTime}
│ 📅 আজকের তারিখ: ${new Date().toLocaleDateString('bn-BD')}
└─────────────────────────────┘

┌─── ⚠️ সবার জন্য মনে রাখার বিষয় ───┐
│ 📋 গ্রুপের নিয়ম মেনে চলুন
│ 🤝 সবার সাথে ভালো ব্যবহার করুন
│ 🚫 স্প্যাম বা বিজ্ঞাপন এড়িয়ে চলুন
│ 🌟 গ্রুপের পরিবেশ ভালো রাখুন
│ 👑 এডমিনদের সম্মান করুন
└─────────────────────────────────────┘

🛡️ এডমিনের সিদ্ধান্তকে সম্মান করি!

⋆✦⋆⎯⎯⎯⎯⎯⎯⎯⎯⎯⋆✦⋆
🚩 𝙏𝙊𝙃𝙄-𝘽𝙊𝙏 𝙏𝙀𝘼𝙈
⋆✦⋆⎯⎯⎯⎯⎯⎯⎯⎯⎯⋆✦⋆`;

    try {
      // Download and register font
      let fontPath = path.join(__dirname, "cache", "font.ttf");
      if (!fs.existsSync(fontPath)) {
        try {
          let fontResponse = await apiCallWithRetry(fontlink, { responseType: 'arraybuffer' }, 2);
          fs.writeFileSync(fontPath, fontResponse.data);
        } catch (fontError) {
          console.error('Font download error:', fontError.message);
        }
      }

      if (fs.existsSync(fontPath)) {
        registerFont(fontPath, { family: 'CustomFont' });
      }

      // Download random background
      let backgroundImage;
      try {
        let randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
        let background = await apiCallWithRetry(randomBackground, { responseType: 'arraybuffer' }, 2);
        backgroundImage = await loadImage(background.data);
      } catch (bgError) {
        console.error('Background download error:', bgError.message);
        // Create gradient background as fallback
        const canvas = createCanvas(1280, 720);
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 1280, 720);
        gradient.addColorStop(0, '#2C3E50');
        gradient.addColorStop(0.5, '#34495E');
        gradient.addColorStop(1, '#2C3E50');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1280, 720);
        backgroundImage = await loadImage(canvas.toBuffer());
      }

      // Get and process avatar
      let roundAvatarImg;
      try {
        let avatarUrl = `https://graph.facebook.com/${leftParticipantFbId}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        let avatarPath = path.join(__dirname, "cache/leave/leave_avatar.png");

        let avatarResponse = await apiCallWithRetry(avatarUrl, { responseType: 'arraybuffer' }, 2);
        fs.writeFileSync(avatarPath, avatarResponse.data);

        const Jimp = require("jimp");
        let avatar = await Jimp.read(avatarPath);
        avatar.circle();
        let roundAvatar = await avatar.getBufferAsync('image/png');
        roundAvatarImg = await loadImage(roundAvatar);
      } catch (avatarError) {
        console.error('Avatar processing error:', avatarError.message);
        // Create default avatar
        const avatarCanvas = createCanvas(420, 420);
        const avatarCtx = avatarCanvas.getContext('2d');
        
        // Gradient circle
        const gradient = avatarCtx.createRadialGradient(210, 210, 0, 210, 210, 210);
        gradient.addColorStop(0, '#3498DB');
        gradient.addColorStop(1, '#2980B9');
        avatarCtx.fillStyle = gradient;
        avatarCtx.beginPath();
        avatarCtx.arc(210, 210, 210, 0, Math.PI * 2);
        avatarCtx.fill();
        
        // Add user initial
        avatarCtx.fillStyle = '#FFF';
        avatarCtx.font = 'bold 150px Arial';
        avatarCtx.textAlign = 'center';
        avatarCtx.fillText(name.charAt(0).toUpperCase(), 210, 280);
        
        roundAvatarImg = await loadImage(avatarCanvas.toBuffer());
      }

      // Create main canvas
      const canvas = createCanvas(1280, 720);
      const ctx = canvas.getContext('2d');
      const shortName = name.length > 15 ? name.slice(0, 15) + "..." : name;

      // Draw background
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

      // Add overlay for better text visibility
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw avatar with border
      const avatarX = canvas.width / 2 - 210;
      const avatarY = canvas.height / 2 - 180;
      
      // Avatar border
      ctx.strokeStyle = isSelfLeave ? '#FFD700' : '#FF6B6B';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(avatarX + 210, avatarY + 210, 214, 0, Math.PI * 2);
      ctx.stroke();
      
      // Draw avatar
      ctx.drawImage(roundAvatarImg, avatarX, avatarY, 420, 420);

      // Set font
      const fontFamily = fs.existsSync(fontPath) ? 'CustomFont' : 'Arial';

      // Draw name with shadow
      ctx.font = `bold 80px ${fontFamily}`;
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.fillText(shortName, canvas.width / 2 + 2, canvas.height / 2 + 132);
      
      ctx.fillStyle = '#FFF';
      ctx.fillText(shortName, canvas.width / 2, canvas.height / 2 + 130);

      // Draw status text
      ctx.font = `40px ${fontFamily}`;
      const statusText = isSelfLeave ? "নিজেই চলে গেছে!" : "এডমিন রিমুভ করলো!";
      const statusColor = isSelfLeave ? '#FFD700' : '#FF6B6B';
      
      ctx.fillStyle = '#000';
      ctx.fillText(statusText, canvas.width / 2 + 2, canvas.height / 2 + 202);
      
      ctx.fillStyle = statusColor;
      ctx.fillText(statusText, canvas.width / 2, canvas.height / 2 + 200);

      // Draw group name
      ctx.font = `30px ${fontFamily}`;
      ctx.fillStyle = '#000';
      ctx.fillText(threadName, canvas.width / 2 + 2, canvas.height / 2 + 252);
      
      ctx.fillStyle = '#87CEEB';
      ctx.fillText(threadName, canvas.width / 2, canvas.height / 2 + 250);

      // Save final image
      let finalImagePath = path.join(__dirname, 'cache/leave/leave.png');
      let finalImage = canvas.toBuffer();
      fs.writeFileSync(finalImagePath, finalImage);

      // Send message with image
      try {
        return api.sendMessage({
          body: isSelfLeave ? leaveSelfMsg : leaveKickMsg,
          attachment: fs.createReadStream(finalImagePath)
        }, event.threadID);
      } catch (sendError) {
        console.error('Failed to send with image:', sendError.message);
        // Send without image
        return api.sendMessage({
          body: isSelfLeave ? leaveSelfMsg : leaveKickMsg
        }, event.threadID);
      }

    } catch (imageError) {
      console.error('Leave image generation error:', imageError.message);

      // Send message without image
      try {
        return api.sendMessage({
          body: isSelfLeave ? leaveSelfMsg : leaveKickMsg
        }, event.threadID);
      } catch (fallbackError) {
        console.error('Failed to send fallback message:', fallbackError.message);
        return;
      }
    }

  } catch (error) {
    console.error('LeaveNoti main error:', error.message);

    // Final fallback
    try {
      const leftParticipantFbId = event.logMessageData.leftParticipantFbId;
      const name = global.data.userName.get(leftParticipantFbId) || "Unknown User";
      const isSelfLeave = event.author == leftParticipantFbId;

      const fallbackMsg = `
${isSelfLeave ? '👋' : '⚡'} ${name} ${isSelfLeave ? 'গ্রুপ ছেড়ে চলে গেছেন' : 'কে গ্রুপ থেকে রিমুভ করা হয়েছে'}।

🚩 Made by TOHIDUL`;

      return api.sendMessage(fallbackMsg, event.threadID);
    } catch (finalError) {
      console.error('Final fallback failed:', finalError.message);
      return;
    }
  }
};

// Helper function for styling text
function stylishText(text) {
  return `✨ ${text} ✨`;
}
