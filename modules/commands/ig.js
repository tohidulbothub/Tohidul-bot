module.exports.config = {
  name: "prefixgreet",
  version: "1.0.5",
  hasPermssion: 0,
  credits: "TOHIDUL BOT HUB",
  description: "🔥 বটের প্রিফিক্স দেখাও এবং এপিক গ্রিটিং পাও! 🚀",
  commandCategory: "system",
  usages: "",
  cooldowns: 3
};

const boxTop = "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓";
const boxBot = "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛";
const boxBar = "┃";
const pad = (txt) => txt.padEnd(38, " ");
const line = (txt) => `${boxBar} ${pad(txt)}${boxBar}`;

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, messageID, body } = event;
  const prefix = global.config.PREFIX || "/";

  if (!body || body.trim() !== prefix) return;

  const message = [
    boxTop,
    line("🌟 𝗔𝘀𝘀𝗮𝗹𝗮𝗺𝘂𝗮𝗹𝗮𝗶𝗸𝘂𝗺! 🌟"),
    line(""),
    line("👋 𝗞𝗲𝗺𝗼𝗻 𝗮𝘀𝗲𝗻?! 😎"),
    line(""),
    line(`🔧 𝗣𝗿𝗲𝗳𝗶𝘅: [ ${prefix} ]`),
    line("🎨 𝗠𝗮𝗱𝗲 𝗯𝘆: ✨ ŤØĤƗĐɄŁ ✨"),
    line(""),
    line(`💥 ${prefix}help to see all commad! 🚀`),
    boxBot
  ].join("\n");

  return api.sendMessage(message, threadID, messageID);
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;
  const prefix = global.config.PREFIX || "/";

  const message = [
    boxTop,
    line("🌟 𝗔𝘀𝘀𝗮𝗹𝗮𝗺𝘂𝗮𝗹𝗮𝗶𝗸𝘂𝗺! 🌟"),
    line(""),
    line("👋 𝗞𝗲𝗺𝗼𝗻 𝗮𝘀𝗲𝗻?! 😎"),
    line(""),
    line(`🔧 𝗣𝗿𝗲𝗳𝗶𝘅: [ ${prefix} ]`),
    line("🎨 𝗠𝗮𝗱𝗲 𝗯𝘆: ✨ ŤØĤƗĐɄŁ ✨"),
    line(""),
    line(`💥 ${prefix}help to see all commad! 🚀`),
    boxBot
  ].join("\n");

  return api.sendMessage(message, threadID, messageID);
};
