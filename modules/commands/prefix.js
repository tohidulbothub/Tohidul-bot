module.exports.config = {
  name: "prefixgreet",
  version: "1.0.6",
  hasPermssion: 0,
  credits: "TOHI-BOT-HUB",
  description: "🔥 স্টাইলিশ প্রিফিক্স গ্রিটিং! 🚀",
  usePrefix: false,
  commandCategory: "system",
  usages: "",
  cooldowns: 3
};

const boxTop = "╔══════════════════════════════╗";
const boxBot = "╚══════════════════════════════╝";
const boxBar = "║";
const pad = (txt) => txt.padEnd(30, " ");
const line = (txt) => `${boxBar} ${pad(txt)}${boxBar}`;

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, messageID, body } = event;
  const prefix = global.config.PREFIX || "/";

  if (!body || body.trim() !== prefix) return;

  const message = [
    boxTop,
    line("🌟 𝐀𝐬𝐬𝐚𝐥𝐚𝐦𝐮𝐚𝐥𝐚𝐢𝐤𝐮𝐦 🌟"),
    line(""),
    line("✨ 𝐇𝐞𝐲 𝐓𝐡𝐞𝐫𝐞! 👋"),
    line(""),
    line(`🔑 𝐏𝐫𝐞𝐟𝐢𝐱: 「 ${prefix} 」`),
    line("💎 𝐁𝐲: TOHIDUL ✨"),
    line(""),
    line(`🚀 ${prefix}help 𝐟𝐨𝐫 𝐜𝐦𝐝! 💫`),
    boxBot
  ].join("\n");

  return api.sendMessage(message, threadID, messageID);
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;
  const prefix = global.config.PREFIX || "/";

  const message = [
    boxTop,
    line("🌟 𝐀𝐬𝐬𝐚𝐥𝐚𝐦𝐮𝐚𝐥𝐚𝐢𝐤𝐮𝐦 🌟"),
    line(""),
    line("✨ 𝐇𝐞𝐲 𝐓𝐡𝐞𝐫𝐞! 👋"),
    line(""),
    line(`🔑 𝐏𝐫𝐞𝐟𝐢𝐱: 「 ${prefix} 」`),
    line("💎 𝐁𝐲: TOHIDUL ✨"),
    line(""),
    line(`🚀 ${prefix}help 𝐟𝐨𝐫 𝐜𝐦𝐝! 💫`),
    boxBot
  ].join("\n");

  return api.sendMessage(message, threadID, messageID);
};
