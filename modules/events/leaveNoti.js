module.exports.config = {
  name: "leave",
  eventType: ["log:unsubscribe"],
  version: "4.0.0",
  credits: "TOHI-BOT-HUB (Video Only Version by TOHIDUL)",
  description: "🎭 Enhanced leave notification with video and Bengali styling - Video Only",
  dependencies: {
    "fs-extra": "",
    "path": "",
    "axios": ""
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
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache'
        }
      });
      fs.writeFileSync(filepath, response.data);
      return true;
    } catch (error) {
      console.log(`Download attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
  return false;
}

// Enhanced video downloader with multiple sources
async function downloadLeaveVideo() {
  try {
    const cacheDir = path.join(__dirname, 'cache/leave');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const videoPath = path.join(cacheDir, 'pakar_video.mp4');

    // Multiple video sources - some are working MP4 links
    const videoSources = [
      'https://drive.google.com/uc?export=download&id=1A0Kp0N92PaU_video_file',
      'https://cdn.fbsbx.com/v/t42.1790-29/sample_video.mp4',
      'https://sample-videos.com/zip/10/mp4/SampleVideo_720x480_1mb.mp4',
      'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4',
      'https://file-examples.com/storage/fe68c8ffa7c2b3e69030493/2017/10/file_example_MP4_480_1_5MG.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    ];

    // Try each video source
    for (let i = 0; i < videoSources.length; i++) {
      try {
        console.log(`Trying video source ${i + 1}/${videoSources.length}`);
        await downloadFile(videoSources[i], videoPath);

        // Check if file exists and has reasonable size
        if (fs.existsSync(videoPath)) {
          const stats = fs.statSync(videoPath);
          if (stats.size > 1000) { // At least 1KB
            console.log(`Video downloaded successfully from source ${i + 1}`);
            return fs.createReadStream(videoPath);
          }
        }
      } catch (error) {
        console.log(`Video source ${i + 1} failed:`, error.message);
        continue;
      }
    }

    // Fallback: Try to use YouTube video downloader APIs
    try {
      const ytDownloadAPIs = [
        'https://api.cobalt.tools/api/json',
        'https://yt-dlp-api.vercel.app/api/download'
      ];

      for (const apiUrl of ytDownloadAPIs) {
        try {
          if (apiUrl.includes('cobalt')) {
            const response = await axios.post(apiUrl, {
              url: 'https://youtu.be/A0Kp0N92PaU',
              vQuality: "480",
              vFormat: "mp4"
            }, {
              timeout: 20000,
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            });

            if (response.data && response.data.url) {
              await downloadFile(response.data.url, videoPath);
              if (fs.existsSync(videoPath) && fs.statSync(videoPath).size > 1000) {
                return fs.createReadStream(videoPath);
              }
            }
          }
        } catch (apiError) {
          console.log('YouTube API failed:', apiError.message);
          continue;
        }
      }
    } catch (ytError) {
      console.log('YouTube download failed:', ytError.message);
    }

    // Final fallback: Create a simple text file as video placeholder
    const fallbackPath = path.join(cacheDir, 'fallback.txt');
    fs.writeFileSync(fallbackPath, 'পাকার পাকার পাকারলে! ভিডিও লোড করতে পারছি না। 😢');
    return null; // Return null to indicate no video available

  } catch (error) {
    console.log('Video download completely failed:', error.message);
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

    // Try to download and send video
    try {
      console.log('🎬 Attempting to download leave video...');
      const videoStream = await downloadLeaveVideo();

      const messageData = {
        body: isKicked ? kickedMessage : selfLeaveMessage
      };

      if (videoStream) {
        messageData.attachment = videoStream;
        console.log('✅ Video attached successfully');
      } else {
        console.log('❌ No video available, sending text only');
      }

      return api.sendMessage(messageData, threadID);

    } catch (videoError) {
      console.log('Video processing failed:', videoError.message);

      // Send message without video
      const messageData = {
        body: isKicked ? kickedMessage : selfLeaveMessage
      };

      return api.sendMessage(messageData, threadID);
    }

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