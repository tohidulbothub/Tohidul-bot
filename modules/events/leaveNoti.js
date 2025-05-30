module.exports.config = {
  name: "leave",
  eventType: ["log:unsubscribe"],
  version: "1.2.0",
  credits: "TOHI-BOT-HUB (Enhanced by TOHIDUL)",
  description: "Enhanced stylish notification when someone leaves or is kicked from the group",
  dependencies: {
    "fs-extra": "",
    "path": "",
    "canvas": "",
    "jimp": "",
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
  "https://i.imgur.com/UucSRWJ.jpeg"
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

    // Enhanced Bangla & Stylish message for self-leave
    const leaveSelfMsg = `
╔════════════════════════════╗
  😊 𝗦𝗘𝗟𝗙 𝗟𝗘𝗔𝗩𝗘 𝗗𝗘𝗧𝗘𝗖𝗧𝗘𝗗 😊
╚════════════════════════════╝

👋 ${name} নিজেই গ্রুপ ছেড়ে চলে গেছেন!

💭 হয়তো:
┣━ কোনো ব্যস্ততার কারণে
┣━ গ্রুপে সময় দিতে পারছেন না
┣━ অন্য কোনো ব্যক্তিগত কারণে
┗━ বা হয়তো ভুলে গেছেন আমাদের! 😅

📊 গ্রুপ আপডেট:
┣━ গ্রুপ: ${threadName}
┣━ অবশিষ্ট সদস্য: ${remainingMembers} জন
┗━ তারিখ: ${currentTime}

🌟 ${name}, আপনার অনুপস্থিতি আমরা অনুভব করবো!
💝 যেকোনো সময় ফিরে আসতে পারেন।

আল্লাহ হাফেজ! 🤲

────────────✦────────────
🚩 𝙏𝙊𝙃𝙄-𝘽𝙊𝙏 𝙏𝙀𝘼𝙈
────────────✦────────────`;

    // Enhanced Bangla & Stylish message for admin kick
    const leaveKickMsg = `
╔════════════════════════════╗
  👮‍♂️ 𝗔𝗗𝗠𝗜𝗡 𝗔𝗖𝗧𝗜𝗢𝗡 👮‍♂️
╚════════════════════════════╝

⚡ ${name} কে গ্রুপ থেকে রিমুভ করা হয়েছে!

🎯 এডমিন অ্যাকশনের কারণ হতে পারে:
┣━ গ্রুপ নিয়ম ভঙ্গ
┣━ অনুপযুক্ত আচরণ
┣━ স্প্যামিং বা বিজ্ঞাপন
┗━ গ্রুপের সাথে মানানসই নয়

📊 গ্রুপ আপডেট:
┣━ গ্রুপ: ${threadName}
┣━ অবশিষ্ট সদস্য: ${remainingMembers} জন
┗━ তারিখ: ${currentTime}

⚠️ সবাইকে মনে রাখতে হবে:
┣━ গ্রুপের নিয়ম মেনে চলুন
┣━ সবার সাথে ভালো ব্যবহার করুন
┣━ স্প্যাম বা বিজ্ঞাপন এড়িয়ে চলুন
┗━ গ্রুপের পরিবেশ ভালো রাখুন

🛡️ এডমিনের সিদ্ধান্তকে সম্মান করি!

────────────✦────────────
🚩 𝙏𝙊𝙃𝙄-𝘽𝙊𝙏 𝙏𝙀𝘼𝙈
────────────✦────────────`;

    try {
      // Download and register font with retry logic
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

      // Pick random background with retry logic
      let backgroundImage;
      try {
        let randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
        let background = await apiCallWithRetry(randomBackground, { responseType: 'arraybuffer' }, 2);
        backgroundImage = await loadImage(background.data);
      } catch (bgError) {
        console.error('Background download error:', bgError.message);
        // Create a simple colored background as fallback
        const canvas = createCanvas(1280, 720);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#2C3E50';
        ctx.fillRect(0, 0, 1280, 720);
        backgroundImage = await loadImage(canvas.toBuffer());
      }

      // Get avatar & make circle with retry logic
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
        // Create a simple circle as fallback
        const avatarCanvas = createCanvas(420, 420);
        const avatarCtx = avatarCanvas.getContext('2d');
        avatarCtx.fillStyle = '#34495E';
        avatarCtx.beginPath();
        avatarCtx.arc(210, 210, 210, 0, Math.PI * 2);
        avatarCtx.fill();
        roundAvatarImg = await loadImage(avatarCanvas.toBuffer());
      }

      // Canvas setup
      const canvas = createCanvas(1280, 720);
      const ctx = canvas.getContext('2d');
      const shortName = name.length > 15 ? name.slice(0, 15) + "..." : name;

      // Draw background and avatar
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(roundAvatarImg, canvas.width / 2 - 210, canvas.height / 2 - 180, 420, 420);

      // Draw texts with custom font or fallback
      const fontFamily = fs.existsSync(fontPath) ? 'CustomFont' : 'Arial';

      ctx.font = `bold 80px ${fontFamily}`;
      ctx.fillStyle = '#FFF';
      ctx.textAlign = 'center';
      ctx.fillText(shortName, canvas.width / 2, canvas.height / 2 + 130);

      ctx.font = `40px ${fontFamily}`;
      ctx.fillStyle = isSelfLeave ? '#FFD700' : '#FF6B6B';
      ctx.fillText(isSelfLeave ? "নিজেই চলে গেছে!" : "এডমিন রিমুভ করলো!", canvas.width / 2, canvas.height / 2 + 200);

      // Add additional text
      ctx.font = `30px ${fontFamily}`;
      ctx.fillStyle = '#87CEEB';
      ctx.fillText(threadName, canvas.width / 2, canvas.height / 2 + 250);

      // Save final image
      let finalImagePath = path.join(__dirname, 'cache/leave/leave.png');
      let finalImage = canvas.toBuffer();
      fs.writeFileSync(finalImagePath, finalImage);

      // Send enhanced stylish Bangla message with image
      try {
        return api.sendMessage({
          body: isSelfLeave ? leaveSelfMsg : leaveKickMsg,
          attachment: fs.createReadStream(finalImagePath)
        }, event.threadID);
      } catch (sendError) {
        console.error('Failed to send message with image:', sendError.message);
        // Try sending without image
        return api.sendMessage({
          body: isSelfLeave ? leaveSelfMsg : leaveKickMsg
        }, event.threadID);
      }

    } catch (imageError) {
      console.error('Leave image generation error:', imageError.message);

      // Send message without image if image processing fails
      try {
        return api.sendMessage({
          body: isSelfLeave ? leaveSelfMsg : leaveKickMsg
        }, event.threadID);
      } catch (fallbackError) {
        console.error('Failed to send fallback message:', fallbackError.message);
        // If even the fallback fails, just return silently
        return;
      }
    }

  } catch (error) {
    console.error('LeaveNoti main error:', error.message);

    // Fallback simple leave message
    try {
      const leftParticipantFbId = event.logMessageData.leftParticipantFbId;
      const name = global.data.userName.get(leftParticipantFbId) || "Unknown User";
      const isSelfLeave = event.author == leftParticipantFbId;

      const fallbackMsg = `
${isSelfLeave ? '👋' : '⚡'} ${name} ${isSelfLeave ? 'গ্রুপ ছেড়ে চলে গেছেন' : 'কে গ্রুপ থেকে রিমুভ করা হয়েছে'}।

🚩 Made by TOHIDUL`;

      return api.sendMessage(fallbackMsg, event.threadID);
    } catch (finalError) {
      console.error('Final fallback also failed:', finalError.message);
      // If everything fails, just return silently to prevent crashes
      return;
    }
  }
};