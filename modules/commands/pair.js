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

    // 7. Draw avatars with proper positioning and sizing
    // Calculate responsive sizes based on canvas dimensions
    const avatarSize = Math.min(canvas.width * 0.15, 300); // Max 300px, responsive to canvas width
    const borderSize = avatarSize + 20;
    
    // Left avatar (boy) - positioned from left side
    const leftX = canvas.width * 0.15; // 15% from left
    const leftY = canvas.height * 0.4;  // 40% from top
    
    // Draw border for left avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(leftX + avatarSize/2, leftY + avatarSize/2, borderSize/2, 0, Math.PI * 2, true);
    ctx.fillStyle = "#FFD700";
    ctx.fill();
    ctx.restore();
    
    // Draw left avatar with circular clipping
    ctx.save();
    ctx.beginPath();
    ctx.arc(leftX + avatarSize/2, leftY + avatarSize/2, avatarSize/2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avt1, leftX, leftY, avatarSize, avatarSize);
    ctx.restore();

    // Right avatar (girl) - positioned from right side
    const rightX = canvas.width * 0.85 - avatarSize; // 15% margin from right
    const rightY = canvas.height * 0.4;  // 40% from top
    
    // Draw border for right avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(rightX + avatarSize/2, rightY + avatarSize/2, borderSize/2, 0, Math.PI * 2, true);
    ctx.fillStyle = "#FF69B4";
    ctx.fill();
    ctx.restore();
    
    // Draw right avatar with circular clipping
    ctx.save();
    ctx.beginPath();
    ctx.arc(rightX + avatarSize/2, rightY + avatarSize/2, avatarSize/2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avt2, rightX, rightY, avatarSize, avatarSize);
    ctx.restore();

    // 8. Draw names with responsive font size and positioning
    const nameFontSize = Math.min(canvas.width * 0.04, 60); // Responsive font size
    ctx.font = `bold ${nameFontSize}px Arial`;
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.textAlign = "center";
    
    // Add shadow for better visibility
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Position names below avatars
    const nameY = leftY + avatarSize + nameFontSize + 20;
    ctx.strokeText(name1, leftX + avatarSize/2, nameY);
    ctx.fillText(name1, leftX + avatarSize/2, nameY);
    
    ctx.strokeText(name2, rightX + avatarSize/2, nameY);
    ctx.fillText(name2, rightX + avatarSize/2, nameY);

    // Reset shadow for other elements
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 9. Draw random percentage with responsive positioning
    const percentage = Math.floor(Math.random() * 100) + 1;
    const percentageFontSize = Math.min(canvas.width * 0.08, 150); // Responsive font size
    ctx.font = `bold ${percentageFontSize}px Arial`;
    ctx.fillStyle = "#FF69B4";
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 6;
    ctx.textAlign = "center";

    // Reset shadow first
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Add glow effect for percentage
    ctx.shadowColor = "#FF1493";
    ctx.shadowBlur = 25;

    const percentageY = canvas.height * 0.25; // 25% from top
    ctx.strokeText(`${percentage}%`, canvas.width / 2, percentageY);
    ctx.fillText(`${percentage}%`, canvas.width / 2, percentageY);

    // Reset shadow
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    // 10. Draw beautiful wish message with responsive positioning
    const messageFontSize = Math.min(canvas.width * 0.05, 80); // Responsive font size
    ctx.font = `bold ${messageFontSize}px Arial`;
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, "#FFD700");
    gradient.addColorStop(0.5, "#FF69B4");
    gradient.addColorStop(1, "#FF1493");

    ctx.fillStyle = gradient;
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 3;
    ctx.textAlign = "center";

    // Reset and add shadow for wish message
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;

    const messageY = canvas.height * 0.85; // 85% from top
    ctx.strokeText("❤️ নতুন জুটিকে অনেক অনেক শুভেচ্ছা! ❤️", canvas.width / 2, messageY);
    ctx.fillText("❤️ নতুন জুটিকে অনেক অনেক শুভেচ্ছা! ❤️", canvas.width / 2, messageY);

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