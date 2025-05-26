const fs = require("fs-extra");
const moment = require("moment-timezone");

module.exports.config = {
  name: "admin",
  version: "1.0.0",
  hasPermssion: 0,
  usePrefix:true,
  credits: "TOHI-BOT",
  description: "Show Bot Owner Info",
  commandCategory: "info",
  usages: "",
  cooldowns: 5
};

module.exports.run = async function({ api, event }) {
  const now = moment().tz("Asia/Dhaka").format("DD/MM/YYYY hh:mm:ss A");
  const imagePath = __dirname + "/cache/admin.png";  // Use your local image path

  const ownerInfo =
    `╭─────〔 👑 𝐁𝐎𝐓 𝐎𝐖𝐍𝐄𝐑 𝐈𝐍𝐅𝐎 👑 〕─────╮\n` +
    `┃\n` +
    `┃ 🏷️ 𝗡𝗮𝗺𝗲       : 𝙏 𝙊 𝙃 𝙄 𝘿 𝙐 𝙇 ッ\n` +
    `┃ 👨‍💼 𝗚𝗲𝗻𝗱𝗲𝗿     : 𝗠𝗮𝗹𝗲\n` +
    `┃ 💖 𝗥𝗲𝗹𝗮𝘁𝗶𝗼𝗻   : 𝗦𝗶𝗻𝗴𝗹𝗲\n` +
    `┃ 🎂 𝗔𝗴𝗲         : 18+\n` +
    `┃ 🕌 𝗥𝗲𝗹𝗶𝗴𝗶𝗼𝗻    : 𝗜𝘀𝗹𝗮𝗺\n` +
    `┃ 🎓 𝗘𝗱𝘂𝗰𝗮𝘁𝗶𝗼𝗻  : 𝗜𝗻𝘁𝗲𝗿 1𝘀𝘁 𝗬𝗲𝗮𝗿\n` +
    `┃ 🏠 𝗔𝗱𝗱𝗿𝗲𝘀𝘀    : 𝗧𝗵𝗮𝗸𝘂𝗿𝗴𝗮𝗼𝗻, 𝗕𝗮𝗻𝗴𝗹𝗮𝗱𝗲𝘀𝗵\n` +
    `┃\n` +
    `┣━━━〔 🌐 𝗦𝗢𝗖𝗜𝗔𝗟 𝗟𝗜𝗡𝗞𝗦 〕━━━┫\n` +
    `┃ 🎭 TikTok    : -----------\n` +
    `┃ ✈️ Telegram  : https://t.me/NFTTOHIDUL19\n` +
    `┃ 🌍 Facebook  : https://www.facebook.com/profile.php?id=100092006324917\n` +
    `┃\n` +
    `┣━━━〔 ⏰ 𝗨𝗣𝗗𝗔𝗧𝗘𝗗 𝗧𝗜𝗠𝗘 〕━━━┫\n` +
    `┃ 🕒 ${now}\n` +
    `╰──────────────────────────────╯\n` +
    `💌 𝑪𝒓𝒆𝒂𝒕𝒆𝒅 𝒃𝒚 𝑻𝑶𝑯𝑰𝑫𝑼𝑳 𝑩𝑶𝑻`;

  // Check if the file exists before sending
  if (!fs.existsSync(imagePath)) {
    return api.sendMessage(ownerInfo + "\n\n[⛔] admin.png ফাইলটি cache ফোল্ডারে নেই!", event.threadID);
  }

  return api.sendMessage({
    body: ownerInfo,
    attachment: fs.createReadStream(imagePath)
  }, event.threadID);
};
