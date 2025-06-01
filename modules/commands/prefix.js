
module.exports.config = {
  name: "prefix",
  version: "1.0.7",
  hasPermssion: 0,
  credits: "TOHI-BOT-HUB",
  description: "🔥 স্টাইলিশ প্রিফিক্স গ্রিটিং! 🚀",
  usePrefix: true,
  commandCategory: "system",
  usages: "",
  cooldowns: 3
};

const boxTop = "╔═══════════════════════════════╗";
const boxBot = "╚═══════════════════════════════╝";
const boxBar = "║";
const pad = (txt) => txt.padEnd(31, " ");
const line = (txt) => `${boxBar} ${pad(txt)}${boxBar}`;

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, messageID, body } = event;
  const prefix = global.config.PREFIX || "/";

  if (!body) return;
  const trimmedBody = body.trim().toLowerCase();
  
  // Respond to both exact prefix and "prefix" text
  if (trimmedBody !== prefix && trimmedBody !== "prefix") return;

  const message = [
    boxTop,
    line(""),
    line("🌟 আ্সসালামুআলাইকুম ওয়ারাহমাতুল্লাহি 🌟"),
    line(""),
    line("✨ আমি TOHI-BOT! কেমন আছেন? ✨"),
    line(""),
    line(`🔑 বট প্রিফিক্স: ⟨ ${prefix} ⟩`),
    line(""),
    line("💎 ডেভেলপার: TOHIDUL 💎"),
    line(""),
    line(`🚀 ${prefix}help লিখুন সব কমান্ড দেখার জন্য`),
    line(""),
    line("💝 ধন্যবাদ আমাদের ব্যবহার করার জন্য! 💝"),
    line(""),
    boxBot
  ].join("\n");

  return api.sendMessage(message, threadID, messageID);
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;
  const prefix = global.config.PREFIX || "/";

  const message = [
    boxTop,
    line(""),
    line("🌟 আ্সসালামুআলাইকুম ওয়ারাহমাতুল্লাহি 🌟"),
    line(""),
    line("✨ আমি TOHI-BOT! কেমন আছেন? ✨"),
    line(""),
    line(`🔑 বট প্রিফিক্স: ⟨ ${prefix} ⟩`),
    line(""),
    line("💎 ডেভেলপার: TOHIDUL 💎"),
    line(""),
    line(`🚀 ${prefix}help লিখুন সব কমান্ড দেখার জন্য`),
    line(""),
    line("💝 ধন্যবাদ আমাদের ব্যবহার করার জন্য! 💝"),
    line(""),
    boxBot
  ].join("\n");

  return api.sendMessage(message, threadID, messageID);
};
