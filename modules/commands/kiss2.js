
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const jimp = require("jimp");

module.exports.config = {
  name: "kiss2",
  version: "2.0.0",
  hasPermssion: 0,
  usePrefix: true,
  credits: "TOHI-BOT-HUB",
  description: "Create a custom kiss image with you and your friend",
  commandCategory: "img",
  usages: "kiss2 [@mention]",
  cooldowns: 10,
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "path": "",
    "jimp": ""
  }
};

module.exports.onLoad = async () => {
  const { resolve } = require("path");
  const { existsSync, mkdirSync } = require("fs-extra");
  
  const dirMaterial = __dirname + `/cache/canvas/`;
  const backgroundPath = resolve(__dirname, 'cache/canvas', 'kissv3.png');
  
  if (!existsSync(dirMaterial)) {
    mkdirSync(dirMaterial, { recursive: true });
  }
  
  if (!existsSync(backgroundPath)) {
    try {
      // Download background image with retry logic
      const backgroundUrl = "https://i.imgur.com/3laJwc1.jpg";
      let downloadSuccess = false;
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
          
          const response = await axios({
            url: backgroundUrl,
            method: 'GET',
            responseType: 'stream',
            timeout: 20000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });

          const writer = fs.createWriteStream(backgroundPath);
          response.data.pipe(writer);

          await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
          });

          downloadSuccess = true;
          break;
        } catch (error) {
          console.log(`Background download attempt ${attempt} failed:`, error.message);
          if (attempt === 3) {
            console.log("Failed to download kiss2 background image");
          }
        }
      }
    } catch (error) {
      console.log("Error downloading kiss2 background:", error.message);
    }
  }
};

async function downloadAvatarWithRetry(url, filePath, maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Progressive delay: 2s, 4s, 8s, 16s, 32s
      const delay = Math.min(2000 * Math.pow(2, attempt - 1), 32000);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const response = await axios({
        url: url,
        method: 'GET',
        responseType: 'stream',
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      return true;
    } catch (error) {
      console.log(`Avatar download attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt === maxRetries) {
        return false;
      }
    }
  }
  return false;
}

async function makeImage({ one, two }) {
  const __root = path.resolve(__dirname, "cache", "canvas");
  
  try {
    // Check if background exists
    const backgroundPath = path.join(__root, "kissv3.png");
    if (!fs.existsSync(backgroundPath)) {
      console.log("Kiss2 background image not found");
      return null;
    }

    const batgiam_img = await jimp.read(backgroundPath);
    const pathImg = path.join(__root, `kiss_${one}_${two}_${Date.now()}.png`);
    const avatarOne = path.join(__root, `avt_${one}_${Date.now()}.png`);
    const avatarTwo = path.join(__root, `avt_${two}_${Date.now()}.png`);

    // Download avatars with improved rate limiting
    const avatarOneUrl = `https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const avatarTwoUrl = `https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

    console.log("Downloading avatars for kiss2...");
    
    const [avatarOneResult, avatarTwoResult] = await Promise.all([
      downloadAvatarWithRetry(avatarOneUrl, avatarOne),
      downloadAvatarWithRetry(avatarTwoUrl, avatarTwo)
    ]);

    if (!avatarOneResult || !avatarTwoResult) {
      console.log("Failed to download avatars for kiss2");
      // Clean up any partially downloaded files
      try {
        if (fs.existsSync(avatarOne)) fs.unlinkSync(avatarOne);
        if (fs.existsSync(avatarTwo)) fs.unlinkSync(avatarTwo);
      } catch (e) {}
      return null;
    }

    // Create circular avatars
    const circleOne = await jimp.read(await createCircle(avatarOne));
    const circleTwo = await jimp.read(await createCircle(avatarTwo));
    
    // Composite the images (adjust positions as needed)
    batgiam_img
      .composite(circleOne.resize(350, 350), 200, 300)
      .composite(circleTwo.resize(350, 350), 600, 80);

    const raw = await batgiam_img.getBufferAsync("image/png");
    fs.writeFileSync(pathImg, raw);

    // Clean up avatar files
    try {
      fs.unlinkSync(avatarOne);
      fs.unlinkSync(avatarTwo);
    } catch (e) {
      console.log("Error cleaning up avatar files:", e.message);
    }

    return pathImg;
  } catch (error) {
    console.log("Error in kiss2 makeImage:", error.message);
    return null;
  }
}

async function createCircle(imagePath) {
  try {
    const image = await jimp.read(imagePath);
    image.circle();
    return await image.getBufferAsync("image/png");
  } catch (error) {
    console.log("Error creating circle:", error.message);
    throw error;
  }
}

module.exports.run = async function ({ event, api, args }) {
  try {
    const { threadID, messageID, senderID, mentions } = event;
    
    if (!Object.keys(mentions).length) {
      return api.sendMessage("💋 Please mention someone you want to kiss! 💕", threadID, messageID);
    }

    const mentionedUser = Object.keys(mentions)[0];
    const mentionedName = mentions[mentionedUser].replace("@", "");

    // Send loading message
    const loadingMsg = await api.sendMessage("💕 Creating your romantic kiss scene... 💋", threadID);

    try {
      const imagePath = await makeImage({ one: senderID, two: mentionedUser });
      
      if (!imagePath) {
        await api.unsendMessage(loadingMsg.messageID);
        return api.sendMessage("💔 Sorry, I couldn't create the kiss image right now. The servers might be busy. Please try again in a few minutes!", threadID, messageID);
      }

      await api.unsendMessage(loadingMsg.messageID);

      const kissMessages = [
        `💋 What a beautiful kiss scene! ${mentionedName}, you look amazing together! 💕`,
        `😘 Aww, this is so romantic! ${mentionedName}, perfect match! 💖`,
        `💕 Such a sweet moment captured! ${mentionedName}, you two are adorable! 💋`,
        `💖 Love is in the air! ${mentionedName}, what a lovely kiss! 😘`
      ];

      const randomMessage = kissMessages[Math.floor(Math.random() * kissMessages.length)];

      await api.sendMessage({
        body: randomMessage,
        mentions: [{
          tag: mentionedName,
          id: mentionedUser
        }],
        attachment: fs.createReadStream(imagePath)
      }, threadID, () => {
        // Clean up the generated image
        try {
          fs.unlinkSync(imagePath);
        } catch (e) {
          console.log("Error cleaning up kiss2 image file:", e.message);
        }
      }, messageID);

      // Add reaction
      api.setMessageReaction("💋", messageID, (err) => {}, true);

    } catch (error) {
      console.log("Error in kiss2 command execution:", error.message);
      try {
        await api.unsendMessage(loadingMsg.messageID);
      } catch (e) {}
      
      return api.sendMessage("💔 An error occurred while creating the kiss image. Please try again later!", threadID, messageID);
    }

  } catch (error) {
    console.log("Kiss2 command outer error:", error.message);
    return api.sendMessage("💔 An unexpected error occurred. Please try again later!", event.threadID, event.messageID);
  }
};
