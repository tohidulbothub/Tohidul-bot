const fs = require('fs-extra');
const pathFile = __dirname + '/autoreact.txt';

module.exports = {
  config: {
    name: "autoreact",
    version: "1.0.1",
    permission: 0,
    credits: "tohidul (modified from nayan)", // Updated credit!
    description: "Automatically reacts to new messages with a random emoji.",
    prefix: 'auto', // Bot prefix suggestion: 'auto'
    category: "auto",
    usages: "[on]/[off]",
    cooldowns: 5,
    dependencies: {
      "fs-extra": "",
      "axios": ""
    }
  },

  languages: {
    "en": {
      "off": '🤖 Autoreact is now OFF for new messages!',
      "on": '🤖 Autoreact is now ON for new messages!',
      "error": 'Incorrect command. Use: autoautoreact [on|off]'
    }
  },

  handleEvent: async ({ api, event }) => {
    // Ensure the control file exists, default is 'false'
    if (!fs.existsSync(pathFile)) fs.writeFileSync(pathFile, 'false');
    const isEnable = fs.readFileSync(pathFile, 'utf-8');
    if (isEnable === 'true') {
      const reactions = [
        "💀", "🙄", "🤭", "🥺", "😶", "😝", "👿", "🤓", "🥶", "🗿",
        "😾", "🤪", "🤬", "🤫", "😼", "😶‍🌫️", "😎", "🤦", "💅", "👀",
        "☠️", "🧠", "👺", "🤡", "🤒", "🤧", "😫", "😇", "🥳", "😭"
      ];
      const react = reactions[Math.floor(Math.random() * reactions.length)];
      api.setMessageReaction(react, event.messageID, err => {
        if (err) console.error("Error sending reaction:", err);
      }, true);
    }
  },

  start: async ({ api, event, args, getLang }) => {
    const lang = getLang ? getLang : (key => module.exports.languages.en[key]);
    try {
      if (args[0] === 'on') {
        fs.writeFileSync(pathFile, 'true');
        api.sendMessage(lang("on"), event.threadID, event.messageID);
      } else if (args[0] === 'off') {
        fs.writeFileSync(pathFile, 'false');
        api.sendMessage(lang("off"), event.threadID, event.messageID);
      } else {
        api.sendMessage(lang("error"), event.threadID, event.messageID);
      }
    } catch (e) {
      console.log("Unexpected error in autoreact module:", e);
    }
  }
};
