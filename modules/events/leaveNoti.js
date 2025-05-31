
module.exports.config = {
  name: "leave",
  eventType: ["log:unsubscribe"],
  version: "3.0.0",
  credits: "TOHI-BOT-HUB (Complete Remake by TOHIDUL)",
  description: "🎭 Enhanced stylish leave notification with video, image and Bengali styling",
  dependencies: {
    "fs-extra": "",
    "path": "",
    "canvas": "",
    "axios": "",
    "jimp": ""
  }
};

const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

// Enhanced styling function
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
    fire: `🔥 ${text} 🔥`
  };
  return styles[style] || styles.default;
}

// Download function with retry logic
async function downloadFile(url, filepath, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      fs.writeFileSync(filepath, response.data);
      return true;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return false;
}

// YouTube video downloader
async function downloadYouTubeVideo() {
  try {
    const videoUrl = 'https://youtu.be/A0Kp0N92PaU?si=A5gm5WlyLc1o-NHY';
    const videoPath = path.join(__dirname, 'cache/leave/pakar_video.mp4');
    
    // Ensure directory exists
    const videoDir = path.dirname(videoPath);
    if (!fs.existsSync(videoDir)) {
      fs.mkdirSync(videoDir, { recursive: true });
    }

    // Try multiple YouTube download APIs
    const downloadAPIs = [
      `https://api.cobalt.tools/api/json`,
      `https://yt-api.p.rapidapi.com/dl`,
      `https://youtube-video-download1.p.rapidapi.com/dl`
    ];

    for (const apiUrl of downloadAPIs) {
      try {
        let response;
        
        if (apiUrl.includes('cobalt')) {
          response = await axios.post(apiUrl, {
            url: videoUrl,
            vQuality: "720",
            vFormat: "mp4",
            aFormat: "mp3"
          }, {
            timeout: 30000,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          if (response.data && response.data.url) {
            await downloadFile(response.data.url, videoPath);
            return fs.createReadStream(videoPath);
          }
        }
        
      } catch (apiError) {
        continue;
      }
    }

    // Fallback: Download a pre-saved video from GitHub/CDN
    const fallbackVideoUrl = 'https://cdn.discordapp.com/attachments/1234567890/pakar_video.mp4';
    try {
      await downloadFile(fallbackVideoUrl, videoPath);
      return fs.createReadStream(videoPath);
    } catch (fallbackError) {
      console.log('All video download methods failed');
      return null;
    }

  } catch (error) {
    console.log('Video download error:', error.message);
    return null;
  }
}

// Create enhanced leave image
async function createLeaveImage(userInfo, isKicked, threadName) {
  try {
    const { createCanvas, loadImage, registerFont } = require('canvas');
    const Jimp = require('jimp');
    
    // Ensure cache directory
    const cacheDir = path.join(__dirname, 'cache/leave');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    // Background images
    const backgrounds = [
      'https://i.imgur.com/VQXViKI.png',
      'https://i.imgur.com/MnAwD8U.jpg',
      'https://i.imgur.com/tSkuyIu.jpg',
      'https://i.imgur.com/dDSh0wc.jpeg',
      'https://wallpaperaccess.com/full/2029165.jpg',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176'
    ];

    // Download random background
    const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    const bgPath = path.join(cacheDir, 'background.jpg');
    
    let backgroundImg;
    try {
      await downloadFile(randomBg, bgPath);
      backgroundImg = await loadImage(bgPath);
    } catch (bgError) {
      // Create gradient background
      const canvas = createCanvas(1280, 720);
      const ctx = canvas.getContext('2d');
      
      const gradient = ctx.createLinearGradient(0, 0, 1280, 720);
      if (isKicked) {
        gradient.addColorStop(0, '#FF6B6B');
        gradient.addColorStop(0.5, '#FF8E53');
        gradient.addColorStop(1, '#FF6B9D');
      } else {
        gradient.addColorStop(0, '#4ECDC4');
        gradient.addColorStop(0.5, '#44A08D');
        gradient.addColorStop(1, '#093637');
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1280, 720);
      backgroundImg = await loadImage(canvas.toBuffer());
    }

    // Download and process avatar
    const avatarPath = path.join(cacheDir, 'avatar.png');
    const avatarUrl = `https://graph.facebook.com/${userInfo.id}/picture?width=500&height=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    
    let roundAvatarImg;
    try {
      await downloadFile(avatarUrl, avatarPath);
      
      // Create circular avatar with Jimp
      const avatar = await Jimp.read(avatarPath);
      avatar.resize(300, 300);
      avatar.circle();
      
      const roundAvatarPath = path.join(cacheDir, 'round_avatar.png');
      await avatar.writeAsync(roundAvatarPath);
      roundAvatarImg = await loadImage(roundAvatarPath);
      
    } catch (avatarError) {
      // Create default avatar
      const avatarCanvas = createCanvas(300, 300);
      const avatarCtx = avatarCanvas.getContext('2d');
      
      const gradient = avatarCtx.createRadialGradient(150, 150, 0, 150, 150, 150);
      gradient.addColorStop(0, '#3498DB');
      gradient.addColorStop(1, '#2980B9');
      
      avatarCtx.fillStyle = gradient;
      avatarCtx.beginPath();
      avatarCtx.arc(150, 150, 150, 0, Math.PI * 2);
      avatarCtx.fill();
      
      avatarCtx.fillStyle = '#FFF';
      avatarCtx.font = 'bold 120px Arial';
      avatarCtx.textAlign = 'center';
      avatarCtx.fillText(userInfo.name.charAt(0).toUpperCase(), 150, 190);
      
      roundAvatarImg = await loadImage(avatarCanvas.toBuffer());
    }

    // Download custom font
    const fontPath = path.join(cacheDir, 'font.ttf');
    try {
      const fontUrl = 'https://drive.google.com/uc?id=1ZwFqYB-x6S9MjPfYm3t3SP1joohGl4iw&export=download';
      await downloadFile(fontUrl, fontPath);
      registerFont(fontPath, { family: 'CustomFont' });
    } catch (fontError) {
      console.log('Font download failed, using default');
    }

    // Create main canvas
    const canvas = createCanvas(1280, 720);
    const ctx = canvas.getContext('2d');
    
    // Draw background
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
    
    // Add dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add decorative elements
    ctx.fillStyle = isKicked ? 'rgba(255, 107, 107, 0.3)' : 'rgba(78, 205, 196, 0.3)';
    ctx.fillRect(0, 0, canvas.width, 80);
    ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
    
    // Draw avatar with glow effect
    const avatarX = canvas.width / 2 - 150;
    const avatarY = 180;
    
    // Glow effect
    ctx.shadowColor = isKicked ? '#FF6B6B' : '#4ECDC4';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Avatar border
    ctx.strokeStyle = isKicked ? '#FF6B6B' : '#4ECDC4';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(avatarX + 150, avatarY + 150, 154, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw avatar
    ctx.drawImage(roundAvatarImg, avatarX, avatarY, 300, 300);
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    // Set font
    const fontFamily = fs.existsSync(fontPath) ? 'CustomFont' : 'Arial';
    
    // Draw name with shadow effect
    const shortName = userInfo.name.length > 20 ? userInfo.name.slice(0, 20) + "..." : userInfo.name;
    
    ctx.font = `bold 60px ${fontFamily}`;
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.fillText(shortName, canvas.width / 2 + 3, 550);
    
    ctx.fillStyle = '#FFF';
    ctx.fillText(shortName, canvas.width / 2, 547);
    
    // Status text
    ctx.font = `bold 40px ${fontFamily}`;
    const statusText = isKicked ? "এডমিন রিমুভ করলো!" : "নিজেই চলে গেছে!";
    const statusColor = isKicked ? '#FF6B6B' : '#FFD700';
    
    ctx.fillStyle = '#000';
    ctx.fillText(statusText, canvas.width / 2 + 2, 602);
    
    ctx.fillStyle = statusColor;
    ctx.fillText(statusText, canvas.width / 2, 600);
    
    // Group name
    ctx.font = `30px ${fontFamily}`;
    const shortThreadName = threadName.length > 30 ? threadName.slice(0, 30) + "..." : threadName;
    
    ctx.fillStyle = '#000';
    ctx.fillText(`গ্রুপ: ${shortThreadName}`, canvas.width / 2 + 2, 652);
    
    ctx.fillStyle = '#87CEEB';
    ctx.fillText(`গ্রুপ: ${shortThreadName}`, canvas.width / 2, 650);
    
    // Add decorative text
    ctx.font = `25px ${fontFamily}`;
    ctx.fillStyle = isKicked ? '#FF6B6B' : '#4ECDC4';
    ctx.fillText('পাকার পাকার পাকারলে!', canvas.width / 2, 50);
    ctx.fillText('TOHI-BOT TEAM', canvas.width / 2, canvas.height - 30);
    
    // Save image
    const finalImagePath = path.join(cacheDir, 'leave_final.png');
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(finalImagePath, buffer);
    
    return fs.createReadStream(finalImagePath);
    
  } catch (error) {
    console.log('Image creation error:', error.message);
    return null;
  }
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

    // Enhanced messages
    const selfLeaveMessage = `
╔══════════════════════════════╗
${stylishText("পাকার পাকার পাকারলে!", "title")}
╚══════════════════════════════╝

🍃 ${userInfo.name} নিজেই গ্রুপ ছেড়ে চলে গেছেন! 🍂

🎵 ${stylishText("পাকার পাকার পাকারলে!", "fire")} 🎵
🌺 আর ফিরে আসবে না! 🌺

┌─── 🎨 বিদায়ের মুহূর্ত ───┐
│ 💔 মন খারাপ লাগছে
│ 🥀 কান্না পেয়ে গেছে  
│ 💭 ভালোবাসা বাকি রইল
│ 🌙 স্মৃতি থেকে যাবে
└─────────────────────────────┘

🎶 ${stylishText("পাকার পাকার পাকারলে এও!", "bangla")} 🎶
🕊️ ${stylishText("আর ফিরে আসবে না ও!", "love")} 🕊️

┌─── 📊 গ্রুপের তথ্য ───┐
│ 🏠 গ্রুপ: ${threadName}
│ 👥 বর্তমান সদস্য: ${remainingMembers} জন
│ 🕒 সময়: ${currentTime}
│ 📅 তারিখ: ${new Date().toLocaleDateString('bn-BD')}
└─────────────────────────────┘

${stylishText("পাকার পাকার পাকারলে!", "fire")}
${stylishText("আর ফিরে আসবে না!", "love")}

⋆✦⋆⎯⎯⎯⎯⎯⎯⎯⎯⎯⋆✦⋆
🚩 ${stylishText("TOHI-BOT TEAM", "fire")}
⋆✦⋆⎯⎯⎯⎯⎯⎯⎯⎯⎯⋆✦⋆`;

    const kickedMessage = `
╔══════════════════════════════╗
${stylishText("পাকার পাকার পাকারলে!", "title")}
╚══════════════════════════════╝

⚡ ${userInfo.name} কে গ্রুপ থেকে রিমুভ করা হয়েছে! 👮‍♂️

🎵 ${stylishText("পাকার পাকার পাকারলে!", "fire")} 🎵
🔥 এডমিনের রাগে পড়লো! 🔥

┌─── 🎨 রিমুভের কারণ ───┐
│ ⚖️ নিয়ম ভঙ্গ করেছে
│ 😤 স্প্যাম করেছে
│ 🚫 বদমাইশি করেছে  
│ 👑 এডমিন নাখোশ!
│ 🔨 শাস্তি দেওয়া হলো
└─────────────────────────────┘

🎶 ${stylishText("পাকার পাকার পাকারলে এও!", "bangla")} 🎶
💔 ${stylishText("আর ফিরে আসবে না ও!", "love")} 💔

┌─── 📊 গ্রুপের তথ্য ───┐
│ 🏠 গ্রুপ: ${threadName}
│ 👥 বর্তমান সদস্য: ${remainingMembers} জন
│ 🕒 সময়: ${currentTime}
│ 📅 তারিখ: ${new Date().toLocaleDateString('bn-BD')}
└─────────────────────────────┘

⚠️ ${stylishText("সবাই নিয়ম মেনে চলুন!", "warning")}

${stylishText("পাকার পাকার পাকারলে!", "fire")}
${stylishText("আর ফিরে আসবে না!", "love")}

⋆✦⋆⎯⎯⎯⎯⎯⎯⎯⎯⎯⋆✦⋆
🚩 ${stylishText("TOHI-BOT TEAM", "fire")}
⋆✦⋆⎯⎯⎯⎯⎯⎯⎯⎯⎯⋆✦⋆`;

    // Create attachments array
    const attachments = [];
    
    // Download and add video
    try {
      const videoStream = await downloadYouTubeVideo();
      if (videoStream) {
        attachments.push(videoStream);
      }
    } catch (videoError) {
      console.log('Video attachment failed:', videoError.message);
    }
    
    // Create and add image
    try {
      const imageStream = await createLeaveImage(userInfo, isKicked, threadName);
      if (imageStream) {
        attachments.push(imageStream);
      }
    } catch (imageError) {
      console.log('Image attachment failed:', imageError.message);
    }
    
    // Send message
    const messageData = {
      body: isKicked ? kickedMessage : selfLeaveMessage
    };
    
    if (attachments.length > 0) {
      messageData.attachment = attachments;
    }
    
    return api.sendMessage(messageData, threadID);
    
  } catch (error) {
    console.error('LeaveNoti main error:', error.message);
    
    // Fallback message
    try {
      const leftParticipantFbId = event.logMessageData.leftParticipantFbId;
      const name = global.data.userName.get(leftParticipantFbId) || "Unknown User";
      const isKicked = event.author !== leftParticipantFbId;
      
      const fallbackMessage = `
${stylishText("পাকার পাকার পাকারলে!", "title")}

${isKicked ? '⚡' : '🍃'} ${name} ${isKicked ? 'কে রিমুভ করা হয়েছে' : 'গ্রুপ ছেড়ে চলে গেছেন'}।

🎵 পাকার পাকার পাকারলে! 🎵
💔 আর ফিরে আসবে না! 💔

🚩 ${stylishText("TOHI-BOT TEAM", "fire")}`;
      
      return api.sendMessage(fallbackMessage, event.threadID);
      
    } catch (fallbackError) {
      console.error('Fallback message failed:', fallbackError.message);
      return;
    }
  }
};
