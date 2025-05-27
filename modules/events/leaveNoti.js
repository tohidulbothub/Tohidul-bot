module.exports.config = {
  name: "leave",
  eventType: ["log:unsubscribe"],
  version: "1.1.0",
  credits: "TOHI-BOT-HUB (Bangla & Stylish by Copilot)",
  description: "Stylish Bangla notification when someone leaves or is kicked from the group",
  dependencies: {
    "fs-extra": "",
    "path": "",
    "canvas": "",
    "jimp": "",
    "axios": ""
  }
};

const axios = require('axios');
const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const jimp = require("jimp");

let backgrounds = [
  "https://i.imgur.com/MnAwD8U.jpg",
  "https://i.imgur.com/tSkuyIu.jpg"
];
let fontlink = 'https://drive.google.com/u/0/uc?id=1ZwFqYB-x6S9MjPfYm3t3SP1joohGl4iw&export=download';

module.exports.run = async function({ api, event, Users, Threads }) {
  try {
    // Ensure cache/leave exists
    const cacheLeaveDir = path.join(__dirname, "cache", "leave");
    if (!fs.existsSync(cacheLeaveDir)) fs.mkdirSync(cacheLeaveDir, { recursive: true });

    const leftParticipantFbId = event.logMessageData.leftParticipantFbId;
    const name = global.data.userName.get(leftParticipantFbId) || await Users.getNameUser(leftParticipantFbId);

    // Detect leave type
    const isSelfLeave = event.author == leftParticipantFbId;

    // Bangla & Stylish message for self-leave
    const leaveSelfMsg = `
╔════════════════════════════╗
🤣 𝙏𝙪𝙢𝙞 𝙉𝙞𝙟𝙚𝙞 𝙅𝙖𝙤!
╚════════════════════════════╝

😜 উফ! ${name} নিজেই গ্রুপ ছেড়ে পালিয়েছে!

🦶 পেছন দরজা খোলা ছিল, তাই মনে হয় চুপি চুপি চলে গেলো...

আসার সময় চা-বিস্কুট খেয়ে নিও! ☕

───────────────✦───────────────
🚩 𝙏𝙊𝙃𝙄-𝘽𝙊𝙏 𝙏𝙀𝘼𝙈
`;

    // Bangla & Stylish message for admin kick
    const leaveKickMsg = `
╔════════════════════════════╗
😂 𝘽𝙖𝙮𝙚 𝘽𝙖𝙮𝙚 𝙆𝙞𝙘𝙠𝙚𝙙!
╚════════════════════════════╝

🤣 ${name} কে গ্রুপ থেকে বের করে দেওয়া হয়েছে এডমিনের হাতে! 

👢 এডমিনের এক লাথিতে উড়ে গেলো... 
আর একটু থাকলে পিঠে চা-রুটি পেতো 😂

ভবিষ্যতে আর ঝামেলা করো না, নইলে আবার উড়ে যাবে! 🪁

───────────────✦───────────────
🚩 𝙏𝙊𝙃𝙄-𝘽𝙊𝙏 𝙏𝙀𝘼𝙈
`;

    // Download and register font
    let fontPath = path.join(__dirname, "cache", "font.ttf");
    if (!fs.existsSync(fontPath)) {
      let font = (await axios.get(fontlink, { responseType: 'arraybuffer' })).data;
      fs.writeFileSync(fontPath, font);
    }
    registerFont(fontPath, { family: 'CustomFont' });

    // Pick random background
    let randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    let background = await loadImage(randomBackground);

    // Get avatar & make circle
    let avatarUrl = `https://graph.facebook.com/${leftParticipantFbId}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    let avatarPath = path.join(__dirname, "cache/leave/leave_avatar.png");
    let avatarData = (await axios.get(avatarUrl, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(avatarPath, avatarData);
    let avatar = await jimp.read(avatarPath);
    avatar.circle();
    let roundAvatar = await avatar.getBufferAsync('image/png');
    let roundAvatarImg = await loadImage(roundAvatar);

    // Canvas setup
    const canvas = createCanvas(1280, 720);
    const ctx = canvas.getContext('2d');
    const shortName = name.length > 13 ? name.slice(0, 13) + "..." : name;

    // Draw background and avatar
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(roundAvatarImg, canvas.width / 2 - 210, canvas.height / 2 - 180, 420, 420);

    // Draw texts
    ctx.font = 'bold 80px CustomFont';
    ctx.fillStyle = '#FFF';
    ctx.textAlign = 'center';
    ctx.fillText(shortName, canvas.width / 2, canvas.height / 2 + 130);

    ctx.font = '40px CustomFont';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(isSelfLeave ? "নিজেই চলে গেছে!" : "এডমিন কিক দিলো!", canvas.width / 2, canvas.height / 2 + 200);

    // Save final image
    let finalImagePath = path.join(__dirname, 'cache/leave/leave.png');
    let finalImage = canvas.toBuffer();
    fs.writeFileSync(finalImagePath, finalImage);

    // Send stylish Bangla message
    return api.sendMessage({
      body: isSelfLeave ? leaveSelfMsg : leaveKickMsg,
      attachment: fs.createReadStream(finalImagePath)
    }, event.threadID);

  } catch (e) {
    return api.sendMessage("❌ লিভ নোটিফিকেশন পাঠাতে সমস্যা হয়েছে!", event.threadID);
  }
};