module.exports.config = {
  name: "uptime",
  version: "1.0.0",
  permission: 0,
  usePrefix: true,
  credits: "TOHI-BOT-HUB",
  description: "Show beautiful uptime/status for TOHI-BOT",
  commandCategory: "admin",
  usages: "",
  cooldowns: 5,
};

function byte2mb(bytes) {
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let l = 0, n = parseInt(bytes, 10) || 0;
  while (n >= 1024 && ++l) n = n / 1024;
  return `${n.toFixed(n < 10 && l > 0 ? 1 : 0)} ${units[l]}`;
}

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const pidusage = require("pidusage");
  const axios = require("axios");
  const fs = require("fs-extra");
  const moment = require("moment-timezone");
  const { loadImage, createCanvas, registerFont } = require("canvas");
  const timeStart = Date.now();

  // Get CPU and memory usage
  const stats = await pidusage(process.pid);

  // Uptime calculation
  const time = process.uptime();
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor(time % 60);
  const z_1 = (hours < 10) ? '0' + hours : hours;
  const x_1 = (minutes < 10) ? '0' + minutes : minutes;
  const y_1 = (seconds < 10) ? '0' + seconds : seconds;
  const timeNow = moment.tz("Asia/Dhaka").format("DD/MM/YYYY || HH:mm:ss");
  const { commands } = global.client;

  // Font download & register
  const fontDir = __dirname + "/tohibot_fonts";
  if (!fs.existsSync(fontDir)) fs.mkdirSync(fontDir);
  const fonts = [
    { name: "UTM-Avo.ttf", url: "https://github.com/hanakuUwU/font/raw/main/UTM%20Avo.ttf" },
    { name: "phenomicon.ttf", url: "https://github.com/hanakuUwU/font/raw/main/phenomicon.ttf" },
    { name: "CaviarDreams.ttf", url: "https://github.com/hanakuUwU/font/raw/main/CaviarDreams.ttf" }
  ];
  for (const font of fonts) {
    const fontPath = `${fontDir}/${font.name}`;
    if (!fs.existsSync(fontPath)) {
      const fontData = (await axios.get(font.url, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(fontPath, Buffer.from(fontData, "utf-8"));
    }
  }

  // Random anime background + avatar
  const bgLinks = [
    "https://i.imgur.com/9jbBPIM.jpg",
    "https://i.imgur.com/cPvDTd9.jpg",
    "https://i.imgur.com/ZT8CgR1.jpg",
    "https://i.imgur.com/WhOaTx7.jpg",
    "https://i.imgur.com/BIcgJOA.jpg",
    "https://i.imgur.com/EcJt1yq.jpg",
    "https://i.imgur.com/0dtnQ2m.jpg"
  ];
  const lengthchar = (await axios.get('https://raw.githubusercontent.com/mraikero-01/saikidesu_data/main/imgs_data2.json')).data;
  const id = Math.floor(Math.random() * lengthchar.length);

  let pathImg = `${fontDir}/uptime_bg.png`;
  let pathAva = `${fontDir}/uptime_ava.png`;
  let background = (await axios.get(bgLinks[Math.floor(Math.random() * bgLinks.length)], { responseType: "arraybuffer" })).data;
  fs.writeFileSync(pathImg, Buffer.from(background, "utf-8"));
  let ava = (await axios.get(lengthchar[id].imgAnime, { responseType: "arraybuffer" })).data;
  fs.writeFileSync(pathAva, Buffer.from(ava, "utf-8"));

  let bg = await loadImage(pathImg);
  let av = await loadImage(pathAva);
  let canvas = createCanvas(bg.width, bg.height);
  let ctx = canvas.getContext("2d");

  // Draw background & avatar
  ctx.fillStyle = lengthchar[id].colorBg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(av, 800, -160, 1100, 1100);

  // UPTIME BANNER
  registerFont(`${fontDir}/phenomicon.ttf`, { family: "phenomicon" });
  ctx.textAlign = "start";
  ctx.font = "130px phenomicon";
  ctx.fillStyle = "#ffb830";
  ctx.filter = "brightness(100%) contrast(110%)";
  ctx.fillText("TOHI-BOT UPTIME", 95, 340);

  // Uptime time
  registerFont(`${fontDir}/UTM-Avo.ttf`, { family: "UTM" });
  ctx.font = "70px UTM";
  ctx.fillStyle = "#fdfdfd";
  ctx.fillText(`⏰ ${z_1} : ${x_1} : ${y_1}`, 180, 440);

  // Footer
  registerFont(`${fontDir}/CaviarDreams.ttf`, { family: "time" });
  ctx.font = "45px time";
  ctx.fillStyle = "#eab5ff";
  ctx.fillText("🌐 TOHI-BOT | Owner: TOHIDUL", 250, 515);
  ctx.fillText("💎 Stay awesome with TOHI-BOT!", 250, 575);

  // Save image
  const imageBuffer = canvas.toBuffer();
  fs.writeFileSync(pathImg, imageBuffer);

  // Compose stylish message
  let msg =
`╭━━━[ 🤖 𝚃𝙾𝙷𝙸-𝙱𝙾𝚃 𝚄𝙿𝚃𝙸𝙼𝙴 🤖 ]━━━╮

🟢 Bot Status: 𝙊𝙉𝙇𝙄𝙉𝙀
⏱️ Uptime: ${hours}h ${minutes}m ${seconds}s
📅 Date: ${timeNow}

━━━━━━━━━━━━━━━━━━
👑 𝙊𝙬𝙣𝙚𝙧: 𝚃𝙾𝙷𝙸𝙳𝚄𝙻
🤖 𝘽𝙤𝙩 𝙉𝙖𝙢𝙚: TOHI-BOT
🔗 Prefix: ${global.config.PREFIX}
📂 Commands: ${commands.size}
👥 Users: ${global.data.allUserID.length}
💬 Threads: ${global.data.allThreadID.length}
🧠 CPU: ${stats.cpu.toFixed(1)}%
💾 RAM: ${byte2mb(stats.memory)}
🌐 Ping: ${Date.now() - timeStart}ms
🎭 Character ID: ${id}
━━━━━━━━━━━━━━━━━━
🌟 Thank you for using TOHI-BOT!
╰━━━━━━━━━━━━━━━━━━━━╯`;

  return api.sendMessage({
    body: msg,
    attachment: fs.createReadStream(pathImg)
  }, threadID, () => {
    fs.unlinkSync(pathImg);
    fs.unlinkSync(pathAva);
  }, messageID);
};