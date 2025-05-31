
module.exports.config = {
  name: "propose",
  version: "1.0.2",
  hasPermssion: 0,
  usePrefix: true,
  credits: "TOHI-BOT-HUB",
  description: "Propose to someone with a romantic image",
  commandCategory: "love",
  usages: "propose @mention",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "jimp": ""
  }
};

module.exports.onLoad = () => {
  const fs = require("fs-extra");
  const request = require("request");
  const dirMaterial = __dirname + `/modules/commands/cache/canvas/`;
  if (!fs.existsSync(dirMaterial)) fs.mkdirSync(dirMaterial, { recursive: true });
  if (!fs.existsSync(dirMaterial + "propose.png")) {
    request("https://i.imgur.com/AC7pnk1.jpg").pipe(fs.createWriteStream(dirMaterial + "propose.png"));
  }
};

async function makeImage({ one, two }) {
  const axios = require("axios");
  const fs = require("fs-extra");
  const path = require("path");
  const jimp = require("jimp");
  
  const __root = path.resolve(__dirname, "modules/commands/cache/canvas");
  let propose_img = await jimp.read(__root + "/propose.png");
  let pathImg = __root + `/propose_${one}_${two}.png`;
  let avatarOne = __root + `/avt_${one}.png`;
  let avatarTwo = __root + `/avt_${two}.png`;

  try {
    // Get avatars with better error handling
    console.log(`[PROPOSE] Getting avatar for user ${one}`);
    let getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { 
      responseType: 'arraybuffer',
      timeout: 10000
    })).data;
    fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne, 'utf-8'));

    console.log(`[PROPOSE] Getting avatar for user ${two}`);
    let getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { 
      responseType: 'arraybuffer',
      timeout: 10000
    })).data;
    fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, 'utf-8'));

    console.log(`[PROPOSE] Creating image composition`);
    let circleOne = await jimp.read(await circle(avatarOne));
    let circleTwo = await jimp.read(await circle(avatarTwo));
    
    // Resize and composite the images
    propose_img.resize(500, 500)
      .composite(circleOne.resize(65, 65), 142, 86)
      .composite(circleTwo.resize(65, 65), 293, 119);

    let raw = await propose_img.getBufferAsync("image/png");
    fs.writeFileSync(pathImg, raw);
    
    // Clean up temporary files
    if (fs.existsSync(avatarOne)) fs.unlinkSync(avatarOne);
    if (fs.existsSync(avatarTwo)) fs.unlinkSync(avatarTwo);

    console.log(`[PROPOSE] Image created successfully at ${pathImg}`);
    return pathImg;
  } catch (error) {
    console.error("[PROPOSE] Error creating image:", error.message);
    // Clean up files if they exist
    if (fs.existsSync(avatarOne)) fs.unlinkSync(avatarOne);
    if (fs.existsSync(avatarTwo)) fs.unlinkSync(avatarTwo);
    throw error;
  }
}

async function circle(image) {
  const jimp = require("jimp");
  image = await jimp.read(image);
  image.circle();
  return await image.getBufferAsync("image/png");
}

module.exports.run = async function ({ event, api, args }) {
  const fs = require("fs-extra");
  let { threadID, messageID, senderID } = event;
  
  try {
    console.log(`[PROPOSE] Command started by user ${senderID}`);
    
    // Check if someone is mentioned
    var mention = Object.keys(event.mentions)[0];
    if (!mention) {
      console.log(`[PROPOSE] No mention found`);
      return api.sendMessage("💕 Please tag someone to propose to!\nUsage: /propose @mention", threadID, messageID);
    }

    let tag = event.mentions[mention].replace("@", "");
    console.log(`[PROPOSE] Proposing to ${mention} (${tag})`);
    
    // Check if trying to propose to themselves
    if (mention === senderID) {
      console.log(`[PROPOSE] User trying to propose to themselves`);
      return api.sendMessage("😅 You can't propose to yourself! Tag someone else.", threadID, messageID);
    }

    // Send loading message
    console.log(`[PROPOSE] Sending loading message`);
    const loadingMsg = await api.sendMessage("💕 Creating your romantic proposal... Please wait!", threadID);

    var one = senderID;
    var two = mention;
    
    console.log(`[PROPOSE] Creating image for ${one} and ${two}`);
    const imagePath = await makeImage({ one, two });
    
    const proposalMessages = [
      `💕 ${tag}, will you be mine? 💍✨`,
      `🌹 Hey ${tag}, I have something special to ask you... Will you be my partner? 💖`,
      `💝 ${tag}, you make my heart skip a beat! Be mine? 💕`,
      `🥰 ${tag}, will you make me the happiest person and be my love? 💍`,
      `💖 Dear ${tag}, my heart belongs to you. Will you accept my proposal? 🌹`
    ];
    
    const randomMessage = proposalMessages[Math.floor(Math.random() * proposalMessages.length)];
    
    console.log(`[PROPOSE] Unsending loading message and sending final result`);
    await api.unsendMessage(loadingMsg.messageID);
    
    return api.sendMessage({
      body: randomMessage,
      mentions: [{
        tag: tag,
        id: mention
      }],
      attachment: fs.createReadStream(imagePath)
    }, threadID, () => {
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log(`[PROPOSE] Cleaned up image file`);
      }
    }, messageID);
    
  } catch (error) {
    console.error("[PROPOSE] Command error:", error.message);
    console.error("[PROPOSE] Full error:", error);
    return api.sendMessage(
      "❌ **Proposal Failed!**\n\n" +
      "• Unable to create your romantic proposal\n" +
      "• Please try again later\n\n" +
      `🔧 **Error:** ${error.message}\n\n` +
      "💡 **Tip:** Make sure the person you're tagging exists\n" +
      "🚩 **Made by TOHI-BOT-HUB**",
      threadID, messageID
    );
  }
};
