
const OWNER_UIDS = ["100092006324917"];

module.exports.config = {
  name: "hack",
  version: "1.0.3",
  hasPermssion: 0,
  usePrefix: true,
  credits: "TOHI-BOT-HUB",
  description: "prank friends with hack simulation",
  commandCategory: "Group",
  usages: "@tag",
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "canvas": ""
  },
  cooldowns: 0
};

module.exports.wrapText = (ctx, name, maxWidth) => {
  return new Promise(resolve => {
    if (ctx.measureText(name).width < maxWidth) return resolve([name]);
    if (ctx.measureText('W').width > maxWidth) return resolve(null);
    const words = name.split(' ');
    const lines = [];
    let line = '';
    while (words.length > 0) {
      let split = false;
      while (ctx.measureText(words[0]).width >= maxWidth) {
        const temp = words[0];
        words[0] = temp.slice(0, -1);
        if (split) words[1] = `${temp.slice(-1)}${words[1]}`;
        else {
          split = true;
          words.splice(1, 0, temp.slice(-1));
        }
      }
      if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) line += `${words.shift()} `;
      else {
        lines.push(line.trim());
        line = '';
      }
      if (words.length === 0) lines.push(line.trim());
    }
    return resolve(lines);
  });
}

// Enhanced download function with retry logic for rate limiting
async function downloadWithRetry(url, path, axios, fs, maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Progressive delay: 2s, 4s, 8s, 16s, 32s
      const delay = Math.min(2000 * Math.pow(2, attempt - 1), 32000);
      
      if (attempt > 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 20000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      fs.writeFileSync(path, Buffer.from(response.data));
      return true;
      
    } catch (error) {
      
      // If it's a 429 error and we have retries left, continue
      if (error.response?.status === 429 && attempt < maxRetries) {
        continue;
      }
      
      // If it's the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }
    }
  }
  return false;
}

module.exports.run = async function ({ args, Users, Threads, api, event, Currencies }) {
  try {
    const { loadImage, createCanvas } = require("canvas");
    const fs = global.nodemodule["fs-extra"];
    const axios = global.nodemodule["axios"];
    
    const pathImg = __dirname + "/cache/hack_background.png";
    const pathAvt1 = __dirname + "/cache/hack_avatar.png";

    var id = Object.keys(event.mentions)[0] || event.senderID;
    var name = await Users.getNameUser(id);

    // Check if owner is being targeted
    if (OWNER_UIDS.includes(id) && !OWNER_UIDS.includes(event.senderID)) {
      return api.sendMessage(
        `😹👑 হালা tui বাপরে hack করবি! সম্ভব না! 💻❌\n\n😎 Boss কে hack করা যায় না! তোর সাহস দেখে মজা লাগলো! 💪\n\n🔐 Admin level security activated!`,
        event.threadID,
        event.messageID
      );
    }

    // Multiple background options for better availability
    var backgrounds = [
      "https://i.imgur.com/VQXViKI.png",
      "https://i.ibb.co/9ZQX8Kp/hack-background.png",
      "https://cdn.discordapp.com/attachments/123456789/hack-bg.png"
    ];

    // Send initial processing message
    const processingMsg = await api.sendMessage("🔍 Processing hack command... Please wait!", event.threadID);

    // Download avatar with retry logic
    try {
      const avatarUrl = `https://graph.facebook.com/${id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const avatarSuccess = await downloadWithRetry(avatarUrl, pathAvt1, axios, fs, 3);
      
      if (!avatarSuccess) {
        throw new Error("Avatar download failed after retries");
      }
    } catch (error) {
      api.unsendMessage(processingMsg.messageID);
      return api.sendMessage("❌ Failed to download user avatar. Please try again later.", event.threadID, event.messageID);
    }

    // Download background with retry logic and fallback URLs
    let backgroundSuccess = false;
    for (let i = 0; i < backgrounds.length; i++) {
      try {
        backgroundSuccess = await downloadWithRetry(backgrounds[i], pathImg, axios, fs, 3);
        
        if (backgroundSuccess) {
          break;
        }
      } catch (error) {
        if (i === backgrounds.length - 1) {
          // Clean up avatar file
          if (fs.existsSync(pathAvt1)) fs.unlinkSync(pathAvt1);
          api.unsendMessage(processingMsg.messageID);
          return api.sendMessage("❌ Failed to download background image from all sources. Please try again later.", event.threadID, event.messageID);
        }
      }
    }

    // Create canvas and draw with enhanced design
    try {
      let baseImage = await loadImage(pathImg);
      let baseAvt1 = await loadImage(pathAvt1);

      let canvas = createCanvas(baseImage.width, baseImage.height);
      let ctx = canvas.getContext("2d");
      
      // Draw background
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      
      // Enhanced text styling
      ctx.font = "bold 28px Arial";
      ctx.fillStyle = "#FF0000";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.textAlign = "start";

      // Draw text with stroke for better visibility
      const lines = await this.wrapText(ctx, name, 1160);
      if (lines) {
        const text = lines.join('\n');
        ctx.strokeText(text, 200, 497);
        ctx.fillText(text, 200, 497);
      } else {
        ctx.strokeText(name, 200, 497);
        ctx.fillText(name, 200, 497);
      }

      // Function to draw circular avatar
      function drawCircularAvatar(image, x, y, size) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(image, x, y, size, size);
        ctx.restore();
      }

      // Draw circular avatar with proper positioning
      drawCircularAvatar(baseAvt1, 83, 437, 100);

      const imageBuffer = canvas.toBuffer('image/png');
      fs.writeFileSync(pathImg, imageBuffer);
      
      // Clean up avatar file
      if (fs.existsSync(pathAvt1)) fs.unlinkSync(pathAvt1);
      
      // Unsend processing message and send result
      api.unsendMessage(processingMsg.messageID);
      
      return api.sendMessage({ 
        body: `🔥 𝙃𝙖𝙘𝙠 𝘾𝙤𝙢𝙥𝙡𝙚𝙩𝙚 𝙃𝙤 𝙂𝙮𝙖! 💻\n\n🎯 ${name} এর সব data hack হয়ে গেছে! 📱\n🔐 Password, Messages, Photos সব পেয়ে গেছি! 🕵️‍♂️\n\n😈 Next time সাবধান থাকবি! 😎\n\n⚡ Powered by TOHI-BOT-HUB`, 
        attachment: fs.createReadStream(pathImg) 
      }, event.threadID, () => {
        // Clean up background file after sending
        if (fs.existsSync(pathImg)) fs.unlinkSync(pathImg);
      }, event.messageID);
      
    } catch (canvasError) {
      // Clean up files
      if (fs.existsSync(pathImg)) fs.unlinkSync(pathImg);
      if (fs.existsSync(pathAvt1)) fs.unlinkSync(pathAvt1);
      api.unsendMessage(processingMsg.messageID);
      return api.sendMessage("❌ Failed to create hack image. Please try again later.", event.threadID, event.messageID);
    }
    
  } catch (error) {
    return api.sendMessage("❌ Hack command failed. Please try again later.", event.threadID, event.messageID);
  }
}
