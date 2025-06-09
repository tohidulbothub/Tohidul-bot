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

    // 7. Draw avatars with beautiful circular borders
    // Left avatar (boy): updated position and size (252, 492, 965x965)
    const leftCenterX = 252 + 965/2;
    const leftCenterY = 492 + 965/2;
    const radius = 965/2;
    
    // Draw border for left avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(leftCenterX, leftCenterY, radius + 15, 0, Math.PI * 2, true);
    ctx.fillStyle = "#FFD700";
    ctx.fill();
    ctx.restore();
    
    // Draw left avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(leftCenterX, leftCenterY, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avt1, 252, 492, 965, 965);
    ctx.restore();

    // Right avatar (girl): updated position and size (3365, 522, 965x965)
    const rightCenterX = 3365 + 965/2;
    const rightCenterY = 522 + 965/2;
    
    // Draw border for right avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(rightCenterX, rightCenterY, radius + 15, 0, Math.PI * 2, true);
    ctx.fillStyle = "#FF69B4";
    ctx.fill();
    ctx.restore();
    
    // Draw right avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(rightCenterX, rightCenterY, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avt2, 3365, 522, 965, 965);
    ctx.restore();

    // 8. Draw names under each box with better styling
    ctx.font = "bold 80px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.textAlign = "center";
    
    // Add shadow effect for names
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    
    ctx.strokeText(name1, 734, 1732); // left name position with better centering
    ctx.fillText(name1, 734, 1732);
    
    ctx.strokeText(name2, 3847, 1744); // right name position with better centering  
    ctx.fillText(name2, 3847, 1744);

    // Reset shadow for other elements
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 9. Draw random percentage with beautiful styling
    const percentage = Math.floor(Math.random() * 100) + 1;
    ctx.font = "bold 120px Arial";
    ctx.fillStyle = "#FF69B4";
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 4;
    ctx.textAlign = "center";
    
    // Add glow effect for percentage
    ctx.shadowColor = "#FF1493";
    ctx.shadowBlur = 20;
    
    ctx.strokeText(`${percentage}%`, canvas.width / 2, 900);
    ctx.fillText(`${percentage}%`, canvas.width / 2, 900);

    // Reset shadow
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    // 10. Draw beautiful wish message with gradient
    ctx.font = "bold 90px Arial";
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, "#FFD700");
    gradient.addColorStop(0.5, "#FF69B4");
    gradient.addColorStop(1, "#FF1493");
    
    ctx.fillStyle = gradient;
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 3;
    ctx.textAlign = "center";
    
    // Add shadow for wish message
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    
    ctx.strokeText("❤️ নতুন জুটিকে অনেক অনেক শুভেচ্ছা! ❤️", canvas.width / 2, 1250);
    ctx.fillText("❤️ নতুন জুটিকে অনেক অনেক শুভেচ্ছা! ❤️", canvas.width / 2, 1250);

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