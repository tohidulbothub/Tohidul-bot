module.exports.config = {
  name: "kiss",
  version: "2.0.0",
  hasPermssion: 0,
  usePrefix: true,
  credits: "MrTomXxX",
  description: "Kiss the person you want",
  commandCategory: "Love",
  usages: "kiss [tag]",
  cooldowns: 5,
  dependencies: {
      "axios": "",
      "fs-extra": "",
      "path": "",
      "jimp": ""
  }
};

module.exports.onLoad = async() => {
  const { resolve } = global.nodemodule["path"];
  const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
  const dirMaterial = __dirname + `/cache/`;
  const path = resolve(__dirname, 'cache', 'hon.png');
  if (!existsSync(dirMaterial + "")) mkdirSync(dirMaterial, { recursive: true });
  
  // Download with comprehensive retry logic
  if (!existsSync(path)) {
    const fallbackUrls = [
      "https://i.imgur.com/BtSlsSS.jpg",
      "https://i.imgur.com/nBV7zKt.png",
      "https://via.placeholder.com/700x440/ff69b4/ffffff?text=Kiss"
    ];
    
    for (let i = 0; i < fallbackUrls.length; i++) {
      try {
        const rateLimitHandler = require('../../utils/rateLimitHandler');
        await rateLimitHandler.downloadWithRetry(fallbackUrls[i], path, global.nodemodule["axios"], global.nodemodule["fs-extra"]);
        break;
      } catch (error) {
        console.log(`Failed to download from URL ${i + 1}: ${error.message}`);
        if (i === fallbackUrls.length - 1) {
          // Create a simple placeholder file
          global.nodemodule["fs-extra"].writeFileSync(path, 'placeholder');
          console.log('Created placeholder file');
        }
      }
    }
  }
}

async function makeImage({ one, two }) {
  const fs = global.nodemodule["fs-extra"];
  const path = global.nodemodule["path"];
  const axios = global.nodemodule["axios"]; 
  const jimp = global.nodemodule["jimp"];
  const __root = path.resolve(__dirname, "cache");

  try {
    let hon_img = await jimp.read(__root + "/hon.png");
    let pathImg = __root + `/hon_${one}_${two}.png`;
    let avatarOne = __root + `/avt_${one}.png`;
    let avatarTwo = __root + `/avt_${two}.png`;

  // Enhanced avatar download with comprehensive error handling
  const downloadAvatar = async (url, filepath, retries = 5) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.get(url, { 
          responseType: 'arraybuffer', 
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        fs.writeFileSync(filepath, Buffer.from(response.data));
        return;
      } catch (error) {
        const is429 = error.response?.status === 429 || error.toString().includes('429') || error.toString().includes('Rate limited');
        
        if (is429 && i < retries - 1) {
          const delay = Math.min(2000 * Math.pow(2, i), 30000); // Exponential backoff, max 30s
          console.log(`Rate limited, retrying avatar download in ${delay}ms (attempt ${i + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        if (i === retries - 1) {
          // Create a placeholder avatar on final failure
          const placeholderUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent('User')}&size=512&background=random`;
          try {
            const fallbackResponse = await axios.get(placeholderUrl, { responseType: 'arraybuffer', timeout: 10000 });
            fs.writeFileSync(filepath, Buffer.from(fallbackResponse.data));
            return;
          } catch (fallbackError) {
            console.log('Avatar processing error, using default');
            // Create a minimal placeholder
            const canvas = require('canvas');
            const canvasObj = canvas.createCanvas(512, 512);
            const ctx = canvasObj.getContext('2d');
            ctx.fillStyle = '#ff69b4';
            ctx.fillRect(0, 0, 512, 512);
            fs.writeFileSync(filepath, canvasObj.toBuffer());
            return;
          }
        }
        
        throw error;
      }
    }
  };

  await downloadAvatar(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, avatarOne);
    await downloadAvatar(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, avatarTwo);

    let circleOne = await jimp.read(await circle(avatarOne));
    let circleTwo = await jimp.read(await circle(avatarTwo));
    hon_img.resize(700, 440).composite(circleOne.resize(200, 200), 390, 23).composite(circleTwo.resize(180, 180), 140, 80);

    let raw = await hon_img.getBufferAsync("image/png");

    fs.writeFileSync(pathImg, raw);
    
    // Clean up avatar files
    if (fs.existsSync(avatarOne)) fs.unlinkSync(avatarOne);
    if (fs.existsSync(avatarTwo)) fs.unlinkSync(avatarTwo);

    return pathImg;
    
  } catch (error) {
    console.log('makeImage error:', error);
    throw new Error('Failed to create kiss image');
  }
}
async function circle(image) {
  const jimp = global.nodemodule["jimp"];
  image = await jimp.read(image);
  image.circle();
  return await image.getBufferAsync("image/png");
}

module.exports.run = async function ({ event, api, args, Currencies }) { 
  const fs = global.nodemodule["fs-extra"];
  const hc = Math.floor(Math.random() * 101);
  const rd = Math.floor(Math.random() * 100000) + 100000;
  const { threadID, messageID, senderID } = event;
  const mention = Object.keys(event.mentions);
  var one = senderID, two = mention[0];

  if (!two) return api.sendMessage("Please tag 1 person", threadID, messageID);

  try {
    await Currencies.increaseMoney(event.senderID, parseInt(hc*rd));
    
    // Send processing message
    api.sendMessage("💖 Creating your kiss image... Please wait! 😘", threadID);
    
    const path = await makeImage({ one, two });
    const message = `[❤️] The level of affection between you and that person is: ${hc} %\n[❤️] The two of you are blessed by BOT: ${((hc)*rd)} $\n[❤️] Wish you happy 🍀`;
    
    return api.sendMessage({ 
      body: message, 
      attachment: fs.createReadStream(path)
    }, threadID, () => fs.unlinkSync(path), messageID);
    
  } catch (error) {
    console.log('Kiss command error:', error);
    return api.sendMessage("❌ Sorry! There was an error creating your kiss image. Please try again later! 💔", threadID, messageID);
  }
}
}