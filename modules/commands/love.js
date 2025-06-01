
/**
* @author ProCoderMew
* @warn Do not edit code or edit credits
*/

module.exports.config = {
  name: "love", 
  version: "1.0.0", 
  permission: 0,
  credits: "TOHI-BOT-HUB",
  description: "",
  usePrefix: true,
  commandCategory: "Love", 
  usages: "love @", 
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "path": "",
    "canvas": ""
  }
};

const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { loadImage, createCanvas } = require('canvas');

module.exports.onLoad = async () => {
  const cachePath = __dirname + "/cache/";
  const imgPath = path.resolve(__dirname, "cache", "ewhd.png");
  if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath, { recursive: true });
  if (!fs.existsSync(imgPath)) {
    const imgUrl = "https://i.postimg.cc/05tPS3cq/1eb9276ff9b9a420f6fd7de70a3f94b2.jpg";
    const res = await axios.get(imgUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(imgPath, Buffer.from(res.data, "utf-8"));
  }
};

async function makeImage({ one, two }) {
  const fs = require("fs-extra");
  const path = require("path");
  const axios = require("axios");
  const { loadImage, createCanvas } = require('canvas');

  const basePath = path.resolve(__dirname, "cache");
  
  // Load base image
  const baseImg = await loadImage(basePath + "/ewhd.png");
  
  // Create canvas with base image dimensions
  const canvas = createCanvas(baseImg.width, baseImg.height);
  const ctx = canvas.getContext('2d');
  
  // Draw base image
  ctx.drawImage(baseImg, 0, 0);

  // Download avatars
  let avatarOnePath = basePath + `/avt_${one}.png`;
  let avatarTwoPath = basePath + `/avt_${two}.png`;
  let outPath = basePath + `/ewhd_${one}_${two}.png`;

  // Download first avatar
  let res1 = await axios.get(
    `https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
    { responseType: "arraybuffer" }
  );
  fs.writeFileSync(avatarOnePath, Buffer.from(res1.data, "utf-8"));

  // Download second avatar
  let res2 = await axios.get(
    `https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
    { responseType: "arraybuffer" }
  );
  fs.writeFileSync(avatarTwoPath, Buffer.from(res2.data, "utf-8"));

  // Load and process avatars
  const avatar1 = await loadImage(avatarOnePath);
  const avatar2 = await loadImage(avatarTwoPath);

  // Draw circular avatars
  // First avatar (left side)
  ctx.save();
  ctx.beginPath();
  ctx.arc(415, 458, 200, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(avatar1, 215, 258, 400, 400);
  ctx.restore();

  // Second avatar (right side)
  ctx.save();
  ctx.beginPath();
  ctx.arc(1215, 460, 200, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(avatar2, 1015, 260, 400, 400);
  ctx.restore();

  // Save the final image
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outPath, buffer);

  // Cleanup avatars
  fs.unlinkSync(avatarOnePath);
  fs.unlinkSync(avatarTwoPath);

  return outPath;
}

module.exports.run = async function({ event, api, args }) {
  const fs = require("fs-extra");
  const { threadID, messageID, senderID, mentions } = event;
  var mentionId = Object.keys(mentions)[0];
  let mentionTag = mentionId ? mentions[mentionId].replace('@', '') : null;
  if (!mentionId) {
    return api.sendMessage("Please tag 1 person", threadID, messageID);
  } else {
    var id1 = senderID, id2 = mentionId;
    makeImage({ one: id1, two: id2 }).then(imgPath => {
      api.sendMessage(
        {
          body: `👉 @${mentionTag} love you so much🥰'"`,
          mentions: [{ tag: mentionTag, id: mentionId }],
          attachment: fs.createReadStream(imgPath)
        },
        threadID,
        () => fs.unlinkSync(imgPath),
        messageID
      );
    });
  }
};
