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
    line("🤖 TOHI-BOT"),
    line(""),
    line(`🔑 Prefix: ${prefix}`),
    line(""),
    line("👨‍💻 Owner: TOHIDUL"),
    boxBot
  ].join("\n");

  return api.sendMessage(message, threadID, messageID);
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;
  const prefix = global.config.PREFIX || "/";

  const message = [
    boxTop,
    line("🤖 TOHI-BOT"),
    line(""),
    line(`🔑 Prefix: ${prefix}`),
    line(""),
    line("👨‍💻 Owner: TOHIDUL"),
    boxBot
  ].join("\n");

  return api.sendMessage(message, threadID, messageID);
};