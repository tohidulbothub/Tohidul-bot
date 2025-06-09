const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const axios = require("axios");

module.exports.config = {
  name: "pairlove",
  version: "2.1.0",
  permssion: 0,
  usePrefix: true,
  credits: "TOHI-BOT-HUB & Copilot",
  description: "Custom pair card with background link and random love percentage",
  commandCategory: "fun",
  usages: "<background_image_url>",
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "canvas": ""
  },
  cooldowns: 15
};

module.exports.run = async function ({ args, Users, Threads, api, event }) {
  try {
    // Use given link or default to your provided link, but validate it's a proper URL
    let bgUrl = "https://i.postimg.cc/vB3XWjQv/PARI-FN-1.jpg"; // default
    
    // Check if args[0] is provided and is a valid URL
    if (args[0] && (args[0].startsWith('http://') || args[0].startsWith('https://'))) {
      bgUrl = args[0];
    }
    
    const pathImg = __dirname + "/cache/pairlove_bg.png";
    const pathAvt1 = __dirname + "/cache/pairlove_male.png";
    const pathAvt2 = __dirname + "/cache/pairlove_female.png";

    // 1. Download background image
    const bgBuffer = (await axios.get(bgUrl, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathImg, Buffer.from(bgBuffer, "utf-8"));

    // 2. Get thread & users info
    const id1 = event.senderID;
    const name1 = await Users.getNameUser(id1);
    const threadInfo = await api.getThreadInfo(event.threadID);
    const allUsers = threadInfo.userInfo;
    const gender1 = allUsers.find(u => u.id == id1)?.gender || "MALE";
    const botID = api.getCurrentUserID();

    // 3. Pick partner
    let gender2 = gender1 === "FEMALE" ? "MALE" : "FEMALE";
    let partnerList = allUsers.filter(u => u.gender == gender2 && u.id !== id1 && u.id !== botID);
    if (partnerList.length === 0) partnerList = allUsers.filter(u => u.id !== id1 && u.id !== botID);
    const partner = partnerList[Math.floor(Math.random() * partnerList.length)];
    const id2 = partner.id;
    const name2 = await Users.getNameUser(id2);

    // 4. Download profile pictures
    const avt1Buffer = (await axios.get(`https://graph.facebook.com/${id1}/picture?width=300&height=300&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathAvt1, Buffer.from(avt1Buffer, "utf-8"));
    const avt2Buffer = (await axios.get(`https://graph.facebook.com/${id2}/picture?width=300&height=300&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathAvt2, Buffer.from(avt2Buffer, "utf-8"));

    // 5. Load images
    const bg = await loadImage(pathImg);
    const avt1 = await loadImage(pathAvt1);
    const avt2 = await loadImage(pathAvt2);

    // 6. Setup canvas (use bg's size)
    const canvas = createCanvas(bg.width, bg.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    // 7. Draw avatars (left: boy, right: girl) with updated positions
    // Left avatar (boy): more left & higher (x=110, y=216)
    ctx.save();
    ctx.beginPath();
    ctx.arc(204, 250, 100, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avt1, 110, 216, 188, 188);
    ctx.restore();

    // Right avatar (girl): more right & higher (x=1330, y=210)
    ctx.save();
    ctx.beginPath();
    ctx.arc(1424, 250, 100, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avt2, 1330, 210, 188, 188);
    ctx.restore();

    // 8. Draw names under each box with new positions
    ctx.font = "bold 36px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(name1, 204, 445); // left
    ctx.fillText(name2, 1424, 440); // right

    // 9. Draw random percentage (center, below LOVE)
    const percentage = Math.floor(Math.random() * 100) + 1;
    ctx.font = "bold 56px Arial";
    ctx.fillStyle = "#ff1493";
    ctx.textAlign = "center";
    ctx.fillText(`${percentage}%`, canvas.width / 2, 368);

    // 10. Draw stylish wish message (bottom center)
    ctx.font = "bold 42px Arial";
    ctx.fillStyle = "#FFD700";
    ctx.textAlign = "center";
    ctx.fillText("❤️ নতুন জুটিকে অনেক অনেক শুভেচ্ছা! ❤️", canvas.width / 2, 720);

    // 11. Save & cleanup
    const imgBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, imgBuffer);

    // 12. Send message with proper mentions & delete temp files after send
    return api.sendMessage({
      body: `✨ @${name1} ❤️ @${name2} ✨`,
      mentions: [
        { tag: name1, id: id1 },
        { tag: name2, id: id2 }
      ],
      attachment: fs.createReadStream(pathImg)
    }, event.threadID, (err) => {
        try {
          fs.unlinkSync(pathImg);
          fs.unlinkSync(pathAvt1);
          fs.unlinkSync(pathAvt2);
        } catch(e) {}
      }, event.messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage("কিছু সমস্যা হয়েছে! আবার চেষ্টা করুন।", event.threadID, event.messageID);
  }
};