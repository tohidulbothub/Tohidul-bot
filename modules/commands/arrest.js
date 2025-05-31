module.exports.config = {
  name: "arrest",
  version: "2.1.0",
  hasPermssion: 0,
  usePrefix: true,
  credits: "MAHBUB SHAON | Modified: TOHIDUL",
  description: "Arrest a friend you mention",
  commandCategory: "tagfun",
  usages: "[mention]",
  cooldowns: 2,
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "path": "",
    "jimp": ""
  }
};

const OWNER_UIDS = ["100092006324917"]; // Owner UID(s) here

module.exports.onLoad = async () => {
  const { resolve } = global.nodemodule["path"];
  const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
  const { downloadFile } = global.utils;
  const dirMaterial = __dirname + `/cache/canvas/`;
  const path = resolve(__dirname, 'cache/canvas', 'batgiam.png');
  if (!existsSync(dirMaterial + "canvas")) mkdirSync(dirMaterial, { recursive: true });
  if (!existsSync(path)) await downloadFile("https://i.imgur.com/ep1gG3r.png", path);
}

async function makeImage({ one, two }) {
  const fs = global.nodemodule["fs-extra"];
  const path = global.nodemodule["path"];
  const axios = global.nodemodule["axios"];
  const jimp = global.nodemodule["jimp"];
  const __root = path.resolve(__dirname, "cache", "canvas");

  let batgiam_img = await jimp.read(__root + "/batgiam.png");
  let pathImg = __root + `/batgiam_${one}_${two}.png`;
  let avatarOne = __root + `/avt_${one}.png`;
  let avatarTwo = __root + `/avt_${two}.png`;

  let getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne, 'utf-8'));

  let getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, 'utf-8'));

  let circleOne = await jimp.read(await circle(avatarOne));
  let circleTwo = await jimp.read(await circle(avatarTwo));
  batgiam_img.resize(500, 500).composite(circleOne.resize(100, 100), 375, 9).composite(circleTwo.resize(100, 100), 160, 92);

  let raw = await batgiam_img.getBufferAsync("image/png");

  fs.writeFileSync(pathImg, raw);
  fs.unlinkSync(avatarOne);
  fs.unlinkSync(avatarTwo);

  return pathImg;
}
async function circle(image) {
  const jimp = require("jimp");
  image = await jimp.read(image);
  image.circle();
  return await image.getBufferAsync("image/png");
}

module.exports.run = async function ({ event, api }) {
  const fs = global.nodemodule["fs-extra"];
  const { threadID, messageID, senderID } = event;

  try {
    var mention = Object.keys(event.mentions)[0];
    let tag = event.mentions[mention]?.replace("@", "");

    if (!mention) {
      return api.sendMessage("⚠️ দয়া করে কাউকে ট্যাগ করুন!", threadID, messageID);
    }

    // If owner is tagged
    if (OWNER_UIDS.includes(mention)) {
      return api.sendMessage(
        `😹👑 হালা tui baap re arrest korbi!`,
        threadID,
        messageID
      );
    }

    console.log(`[ARREST] Starting arrest command for ${mention} by ${senderID}`);

    var one = senderID, two = mention;

    const path = await makeImage({ one, two });
    console.log(`[ARREST] Image created successfully at: ${path}`);

    // Check if file exists before sending
    if (!fs.existsSync(path)) {
      throw new Error("Generated image file not found");
    }

    return api.sendMessage({
      body: `╭── 👮‍♂️ 𝐀𝐑𝐑𝐄𝐒𝐓 𝐌𝐎𝐃𝐄 👮‍♂️ ──╮
🔒 ${tag}, তোমাকে গ্রেফতার করা হয়েছে!
তুমি এখন আইনের হাতে বন্দী! 🚔😹

⏳ মুক্তি পেতে হলে তহিদুল boss এর সাথে যোগাযোগ করো!

🤖 Ｍａｄｅ ｂｙ ＴＯＨＩＤＵＬ
╰──────────────╯`,
      mentions: [{
        tag: tag,
        id: mention
      }],
      attachment: fs.createReadStream(path)
    }, threadID, () => {
      // Clean up file after sending
      try {
        if (fs.existsSync(path)) {
          fs.unlinkSync(path);
          console.log(`[ARREST] Cleaned up file: ${path}`);
        }
      } catch (cleanupError) {
        console.log(`[ARREST] Cleanup error: ${cleanupError.message}`);
      }
    }, messageID);

  } catch (error) {
    console.log(`[ARREST] Command error: ${error.message}`);
    return api.sendMessage(
      "❌ গ্রেফতার করতে সমস্যা হয়েছে! আবার চেষ্টা করুন।",
      threadID,
      messageID
    );
  }
}