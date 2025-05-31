
module.exports.config = {
  name: "propose",
  version: "2.0.0",
  hasPermssion: 0,
  usePrefix: true,
  credits: "TOHI-BOT-HUB",
  description: "Propose to someone with romantic images and animations",
  commandCategory: "love",
  usages: "propose @mention",
  cooldowns: 10,
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
  
  if (!fs.existsSync(dirMaterial)) {
    fs.mkdirSync(dirMaterial, { recursive: true });
  }

  // Download multiple proposal background images
  const proposalImages = [
    { name: "propose1.png", url: "https://i.imgur.com/AC7pnk1.jpg" },
    { name: "propose2.png", url: "https://i.imgur.com/9XzQC5K.jpg" },
    { name: "propose3.png", url: "https://i.imgur.com/K2mL8vR.jpg" },
    { name: "propose4.png", url: "https://i.imgur.com/P7sN9wT.jpg" },
    { name: "propose5.png", url: "https://i.imgur.com/T8nH4jL.jpg" }
  ];

  proposalImages.forEach(img => {
    if (!fs.existsSync(dirMaterial + img.name)) {
      request(img.url).pipe(fs.createWriteStream(dirMaterial + img.name));
    }
  });
};

async function makeProposalImage({ proposer, target }) {
  const axios = require("axios");
  const fs = require("fs-extra");
  const path = require("path");
  const jimp = require("jimp");
  
  const __root = path.resolve(__dirname, "modules/commands/cache/canvas");
  
  // Select random proposal background
  const proposalBGs = ["propose1.png", "propose2.png", "propose3.png", "propose4.png", "propose5.png"];
  const randomBG = proposalBGs[Math.floor(Math.random() * proposalBGs.length)];
  
  let outputPath = __root + `/proposal_${proposer}_${target}_${Date.now()}.png`;
  let avatarProposer = __root + `/avt_proposer_${proposer}.png`;
  let avatarTarget = __root + `/avt_target_${target}.png`;

  try {
    console.log(`[PROPOSE] Creating proposal from ${proposer} to ${target}`);
    
    // Get high quality avatars
    console.log(`[PROPOSE] Fetching avatars...`);
    const [proposerAvatar, targetAvatar] = await Promise.all([
      axios.get(`https://graph.facebook.com/${proposer}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { 
        responseType: 'arraybuffer',
        timeout: 15000
      }),
      axios.get(`https://graph.facebook.com/${target}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { 
        responseType: 'arraybuffer',
        timeout: 15000
      })
    ]);

    fs.writeFileSync(avatarProposer, Buffer.from(proposerAvatar.data, 'utf-8'));
    fs.writeFileSync(avatarTarget, Buffer.from(targetAvatar.data, 'utf-8'));

    // Load background image
    console.log(`[PROPOSE] Loading background: ${randomBG}`);
    let proposalImg = await jimp.read(__root + "/" + randomBG);
    
    // Create circular avatars
    console.log(`[PROPOSE] Processing avatars...`);
    let circleProposer = await createCircularAvatar(avatarProposer);
    let circleTarget = await createCircularAvatar(avatarTarget);
    
    // Resize background and add avatars with enhanced positioning
    proposalImg.resize(800, 600);
    
    // Add proposer avatar (left side)
    proposalImg.composite(circleProposer.resize(120, 120), 100, 200);
    
    // Add target avatar (right side)
    proposalImg.composite(circleTarget.resize(120, 120), 580, 200);
    
    // Add romantic effects
    await addRomanticEffects(proposalImg);

    // Save the final image
    let raw = await proposalImg.getBufferAsync("image/png");
    fs.writeFileSync(outputPath, raw);
    
    // Clean up temporary files
    [avatarProposer, avatarTarget].forEach(file => {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    });

    console.log(`[PROPOSE] Proposal image created successfully`);
    return outputPath;
    
  } catch (error) {
    console.error("[PROPOSE] Error creating proposal image:", error.message);
    
    // Clean up files on error
    [avatarProposer, avatarTarget, outputPath].forEach(file => {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    });
    
    throw new Error(`Failed to create proposal image: ${error.message}`);
  }
}

async function createCircularAvatar(imagePath) {
  const jimp = require("jimp");
  
  let image = await jimp.read(imagePath);
  
  // Resize to square
  const size = Math.min(image.bitmap.width, image.bitmap.height);
  image = image.cover(size, size);
  
  // Create circle mask
  image.circle();
  
  // Add border effect
  const border = new jimp(size + 10, size + 10, 0xFFFFFFFF);
  border.circle();
  border.composite(image, 5, 5);
  
  return border;
}

async function addRomanticEffects(image) {
  const jimp = require("jimp");
  
  try {
    // Add heart overlay (simple red heart shape)
    const heartSize = 80;
    const heart = new jimp(heartSize, heartSize, 0x00000000);
    
    // Create simple heart shape with red color
    for (let x = 0; x < heartSize; x++) {
      for (let y = 0; y < heartSize; y++) {
        const centerX = heartSize / 2;
        const centerY = heartSize / 2;
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        
        if (distance < heartSize / 3) {
          heart.setPixelColor(0xFF69B4FF, x, y); // Pink color
        }
      }
    }
    
    // Add hearts at various positions
    image.composite(heart, 350, 100);
    image.composite(heart, 250, 450);
    image.composite(heart, 470, 480);
    
  } catch (error) {
    console.log("[PROPOSE] Could not add romantic effects:", error.message);
  }
}

module.exports.run = async function ({ event, api, args }) {
  const fs = require("fs-extra");
  let { threadID, messageID, senderID } = event;
  
  try {
    console.log(`[PROPOSE] 💕 Proposal command initiated by ${senderID}`);
    
    // Check for mentions
    const mentions = Object.keys(event.mentions || {});
    if (mentions.length === 0) {
      return api.sendMessage({
        body: "💕 **How to Propose** 💕\n\n" +
              "Tag someone special to propose to them!\n\n" +
              "📝 **Usage:** `/propose @mention`\n" +
              "💡 **Example:** `/propose @YourCrush`\n\n" +
              "✨ The bot will create a beautiful romantic proposal image!\n" +
              "🚩 **Made by TOHI-BOT-HUB**"
      }, threadID, messageID);
    }

    const targetID = mentions[0];
    const targetName = event.mentions[targetID].replace("@", "");
    
    // Prevent self-proposal
    if (targetID === senderID) {
      return api.sendMessage({
        body: "😅 **Self-Proposal Alert!** 😅\n\n" +
              "You can't propose to yourself, silly! 💖\n\n" +
              "💡 **Tip:** Tag someone else you'd like to propose to\n" +
              "🚩 **Made by TOHI-BOT-HUB**"
      }, threadID, messageID);
    }

    // Send loading message
    const loadingMessages = [
      "💕 Creating your magical proposal moment...",
      "🌹 Preparing something special for your love...",
      "💍 Crafting the perfect romantic proposal...",
      "✨ Making hearts flutter with magic...",
      "💖 Weaving love into a beautiful image..."
    ];
    
    const randomLoading = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
    const loadingMsg = await api.sendMessage(randomLoading, threadID);

    // Get user info for better messages
    const [proposerInfo, targetInfo] = await Promise.all([
      api.getUserInfo(senderID),
      api.getUserInfo(targetID)
    ]);
    
    const proposerName = proposerInfo[senderID]?.name || "Someone";
    const targetRealName = targetInfo[targetID]?.name || targetName;

    // Create proposal image
    console.log(`[PROPOSE] Creating image for proposal...`);
    const imagePath = await makeProposalImage({ 
      proposer: senderID, 
      target: targetID 
    });

    // Romantic proposal messages
    const proposalMessages = [
      `💕 **${targetRealName}**, ${proposerName} has something special to ask you...\n\n🌹 "Will you be mine forever and always?" 💍✨`,
      
      `💖 **Dear ${targetRealName}**, 💖\n\n${proposerName} is kneeling down with a heart full of love...\n\n💍 "Will you make me the happiest person alive by being my partner?" 🥰`,
      
      `🌹 **${targetRealName}**, you are the sunshine in ${proposerName}'s life! ☀️\n\n💕 "Will you accept this proposal and be mine?" 💍`,
      
      `💝 **To the most amazing ${targetRealName}**, 💝\n\n${proposerName} says: "You make my heart skip a beat every day...\n\n💍 Will you be my forever love?" 💖`,
      
      `✨ **${targetRealName}**, under the stars and moon... 🌙⭐\n\n${proposerName} asks with all their heart:\n\n💍 "Will you marry me and be my eternal love?" 💕`
    ];
    
    const randomMessage = proposalMessages[Math.floor(Math.random() * proposalMessages.length)];
    
    // Remove loading message
    await api.unsendMessage(loadingMsg.messageID);
    
    // Send final proposal
    return api.sendMessage({
      body: randomMessage + "\n\n🚩 **Made by TOHI-BOT-HUB**",
      mentions: [
        { tag: targetName, id: targetID },
        { tag: proposerName, id: senderID }
      ],
      attachment: fs.createReadStream(imagePath)
    }, threadID, () => {
      // Clean up image file after sending
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log(`[PROPOSE] ✅ Cleaned up proposal image`);
      }
    }, messageID);
    
  } catch (error) {
    console.error("[PROPOSE] ❌ Command error:", error);
    
    const errorMessages = [
      "💔 **Proposal Creation Failed** 💔\n\n",
      "• Unable to create your romantic proposal\n",
      "• This might be temporary - try again in a moment\n\n",
      `🔧 **Technical Details:** ${error.message}\n\n`,
      "💡 **Troubleshooting:**\n",
      "• Make sure the person you're tagging exists\n",
      "• Check your internet connection\n",
      "• Try again in a few minutes\n\n",
      "📞 **Need Help?** Contact the bot admin\n",
      "🚩 **Made by TOHI-BOT-HUB**"
    ].join("");
    
    return api.sendMessage(errorMessages, threadID, messageID);
  }
};
