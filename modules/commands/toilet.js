
module.exports.config = {
  name: "toilet",
  version: "2.0.0",
  hasPermssion: 0,
  usePrefix: true,
  credits: "TOHI-BOT-HUB",
  description: "Send someone to toilet with a funny image",
  commandCategory: "fun",
  usages: "@mention or reply",
  cooldowns: 5,
  dependencies: {
    "fs-extra": "",
    "axios": "",
    "canvas": "",
    "jimp": ""
  }
};

const OWNER_UIDS = ["100092006324917"];

// Circle crop function using jimp
module.exports.circle = async (image) => {
  const jimp = global.nodemodule['jimp'];
  image = await jimp.read(image);
  image.circle();
  return await image.getBufferAsync("image/png");
};

module.exports.run = async function ({ event, api, args, Users }) {
  try {
    const Canvas = global.nodemodule['canvas'];
    const axios = global.nodemodule["axios"];
    const jimp = global.nodemodule["jimp"];
    const fs = global.nodemodule["fs-extra"];
    
    const pathToilet = __dirname + '/cache/toilet_' + Date.now() + '.png';
    
    // Get target user ID (from mention, reply, or sender)
    let targetID;
    if (Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    } else if (event.messageReply) {
      targetID = event.messageReply.senderID;
    } else {
      targetID = event.senderID;
    }

    // Check if owner is being targeted
    if (OWNER_UIDS.includes(targetID) && !OWNER_UIDS.includes(event.senderID)) {
      return api.sendMessage(
        `😹👑 হালা tui বাপরে toilet এ পাঠাবি! সম্ভব না! 🚽❌\n\n😎 Boss কে toilet এ পাঠানো যায় না! তোর সাহস দেখে মজা লাগলো! 💪`,
        event.threadID,
        event.messageID
      );
    }

    // Get user name for message
    const targetName = await Users.getNameUser(targetID) || "Unknown User";

    // Send processing message
    const processingMsg = await api.sendMessage("🚽 Toilet preparation in progress... 💩", event.threadID);

    // Create canvas
    const canvas = Canvas.createCanvas(500, 670);
    const ctx = canvas.getContext('2d');

    // Background image URLs (multiple fallbacks)
    const backgroundUrls = [
      'https://i.imgur.com/Kn7KpAr.jpg',
      'https://i.ibb.co/9ZQX8Kp/toilet-bg.jpg',
      'https://cdn.discordapp.com/attachments/123456789/toilet-background.jpg'
    ];

    let background;
    let backgroundLoaded = false;

    // Try to load background with fallbacks
    for (let i = 0; i < backgroundUrls.length && !backgroundLoaded; i++) {
      try {
        background = await Canvas.loadImage(backgroundUrls[i]);
        backgroundLoaded = true;
      } catch (error) {
        if (i === backgroundUrls.length - 1) {
          // If all backgrounds fail, create a simple colored background
          ctx.fillStyle = '#87CEEB'; // Sky blue
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw a simple toilet shape
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(150, 400, 200, 150);
          ctx.fillRect(180, 350, 140, 50);
          
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 20px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('TOILET', 250, 475);
        }
      }
    }

    // Draw background if loaded
    if (backgroundLoaded) {
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    }

    // Download and process avatar
    try {
      const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const avatarResponse = await axios.get(avatarUrl, { 
        responseType: 'arraybuffer',
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      // Create circular avatar
      const circularAvatar = await this.circle(avatarResponse.data);
      const avatarImage = await Canvas.loadImage(circularAvatar);
      
      // Draw avatar on canvas (position it in toilet area)
      ctx.drawImage(avatarImage, 135, 350, 205, 205);
      
    } catch (avatarError) {
      // If avatar fails, draw a placeholder
      ctx.fillStyle = '#FF6B6B';
      ctx.beginPath();
      ctx.arc(237.5, 452.5, 102.5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Avatar', 237.5, 452.5);
      ctx.fillText('Failed', 237.5, 472.5);
    }

    // Save the final image
    const imageBuffer = canvas.toBuffer('image/png');
    fs.writeFileSync(pathToilet, imageBuffer);

    // Unsend processing message
    api.unsendMessage(processingMsg.messageID);

    // Send the final image with message
    const funnyMessages = [
      `🚽💩 ${targetName} এখন toilet এ বসে আছে! 😂`,
      `🚽 ${targetName} কে toilet এ পাঠিয়ে দেওয়া হয়েছে! 💩😹`,
      `💩 ${targetName} এর toilet break time! 🚽😂`,
      `🚽 ${targetName} এখন busy toilet এ! 💩🤣`
    ];
    
    const randomMessage = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];

    return api.sendMessage({
      body: randomMessage,
      attachment: fs.createReadStream(pathToilet)
    }, event.threadID, () => {
      // Clean up the image file after sending
      if (fs.existsSync(pathToilet)) {
        fs.unlinkSync(pathToilet);
      }
    }, event.messageID);

  } catch (error) {
    return api.sendMessage(
      `❌ Toilet command failed! Error: ${error.message}\n\nPlease try again later.`,
      event.threadID,
      event.messageID
    );
  }
};
