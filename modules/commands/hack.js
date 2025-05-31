
module.exports.config = {
  name: "hack",
  version: "1.0.1",
  hasPermssion: 0,
  usePrefix: true,
  credits: "MrTomXxX",
  description: "prank friends",
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

module.exports.run = async function ({ args, Users, Threads, api, event, Currencies }) {
  try {
    const { loadImage, createCanvas } = require("canvas");
    const fs = global.nodemodule["fs-extra"];
    const axios = global.nodemodule["axios"];
    
    const pathImg = __dirname + "/cache/hack_background.png";
    const pathAvt1 = __dirname + "/cache/hack_avatar.png";

    var id = Object.keys(event.mentions)[0] || event.senderID;
    var name = await Users.getNameUser(id);

    var background = [
      "https://i.imgur.com/VQXViKI.png"
    ];
    var rd = background[Math.floor(Math.random() * background.length)];

    // Download avatar with proper error handling
    try {
      let getAvtmot = await axios.get(
        `https://graph.facebook.com/${id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        { responseType: "arraybuffer", timeout: 10000 }
      );
      fs.writeFileSync(pathAvt1, Buffer.from(getAvtmot.data));
    } catch (error) {
      console.log('[HACK] Avatar download failed:', error.message);
      return api.sendMessage("❌ Failed to download user avatar. Please try again later.", event.threadID, event.messageID);
    }

    // Download background with proper error handling
    try {
      let getbackground = await axios.get(rd, {
        responseType: "arraybuffer",
        timeout: 10000
      });
      fs.writeFileSync(pathImg, Buffer.from(getbackground.data));
    } catch (error) {
      console.log('[HACK] Background download failed:', error.message);
      // Clean up avatar file
      if (fs.existsSync(pathAvt1)) fs.unlinkSync(pathAvt1);
      return api.sendMessage("❌ Failed to download background image. Please try again later.", event.threadID, event.messageID);
    }

    // Create canvas and draw
    try {
      let baseImage = await loadImage(pathImg);
      let baseAvt1 = await loadImage(pathAvt1);

      let canvas = createCanvas(baseImage.width, baseImage.height);
      let ctx = canvas.getContext("2d");
      
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      ctx.font = "400 23px Arial";
      ctx.fillStyle = "#1878F3";
      ctx.textAlign = "start";

      const lines = await this.wrapText(ctx, name, 1160);
      ctx.fillText(lines.join('\n'), 200, 497);
      ctx.beginPath();

      ctx.drawImage(baseAvt1, 83, 437, 100, 101);

      const imageBuffer = canvas.toBuffer();
      fs.writeFileSync(pathImg, imageBuffer);
      
      // Clean up avatar file
      if (fs.existsSync(pathAvt1)) fs.unlinkSync(pathAvt1);
      
      return api.sendMessage({ 
        body: `𝙃𝙖𝙘𝙠 𝘾𝙤𝙢𝙥𝙡𝙚𝙩𝙚 𝙃𝙤 𝙂𝙮𝙖, 𝘼𝙥𝙠𝙖 𝙄𝙣𝙗𝙤𝙭 𝙋𝙖𝙧 𝙎𝙚𝙣𝙙 𝙆𝙖𝙧𝙙𝙞𝙮𝙖 𝙋𝙖𝙨𝙨𝙬𝙤𝙧𝙙`, 
        attachment: fs.createReadStream(pathImg) 
      }, event.threadID, () => {
        // Clean up background file after sending
        if (fs.existsSync(pathImg)) fs.unlinkSync(pathImg);
      }, event.messageID);
      
    } catch (canvasError) {
      console.log('[HACK] Canvas error:', canvasError.message);
      // Clean up files
      if (fs.existsSync(pathImg)) fs.unlinkSync(pathImg);
      if (fs.existsSync(pathAvt1)) fs.unlinkSync(pathAvt1);
      return api.sendMessage("❌ Failed to create hack image. Please try again later.", event.threadID, event.messageID);
    }
    
  } catch (error) {
    console.log('[HACK] General error:', error.message);
    return api.sendMessage("❌ Hack command failed. Please try again later.", event.threadID, event.messageID);
  }
}
