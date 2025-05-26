/**
* @author ProCoderMew
* @warn Do not edit code or edit credits
*/

module.exports.config = {
  name: "love", 
  version: "1.0.0", 
  permission: 0,
  credits: "Nayan",
  description: "",
  prefix: true,
  category: "Love", 
  usages: "love @", 
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "path": "",
    "jimp": ""
  }
};

const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const jimp = require("jimp");

module.exports.onLoad = async () => {
  const cachePath = __dirname + "/cache/";
  const imgPath = path.resolve(__dirname, "cache", "ewhd.png");
  if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath, { recursive: true });
  if (!fs.existsSync(imgPath)) {
    const imgUrl = "https://i.postimg.cc/zXz75tYZ/dvsdsv.jpg";
    const res = await axios.get(imgUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(imgPath, Buffer.from(res.data, "utf-8"));
  }
};

async function circle(imgPath) {
  let img = await jimp.read(imgPath);
  img.circle();
  return await img.getBufferAsync("image/png");
}

async function makeImage({ one, two }) {
  const fs = require("fs-extra");
  const path = require("path");
  const axios = require("axios");
  const jimp = require("jimp");

  const basePath = path.resolve(__dirname, "cache");
  let baseImg = await jimp.read(basePath + "/ewhd.png");

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

  // Read and process avatars
  let circledOne = await jimp.read(await circle(avatarOnePath));
  let circledTwo = await jimp.read(await circle(avatarTwoPath));

  baseImg
    .resize(1632, 917)
    .composite(circledOne.resize(400, 400), 215, 258)
    .composite(circledTwo.resize(400, 400), 1015, 260);

  let buffer = await baseImg.getBufferAsync("image/png");
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
          body: `👉${mentionTag} love you so much🥰’”`,
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
