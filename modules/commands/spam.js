module.exports.config = {
name: "spam",
  version: "",
  permssion: 2,
  credits: "TOHI-BOT-HUB",
  description: "",
  commandCategory: "admin",
  usages: "[msg] [amount]",
  usePrefix: true,
  cooldowns: 5,
  dependencies: "",
};

module.exports.run = function ({ api, event, Users, args }) {
  const permission = ["100092006324917"];
   if (!permission.includes(event.senderID))
   return api.sendMessage("Only Bot Admin Can Use this command", event.threadID, event.messageID);
  if (args.length !== 2) {
    api.sendMessage(`Invalid number of arguments. Usage: ${global.config.PREFIX}spam [msg] [amount]`, event.threadID);
    return;
  }
  var { threadID, messageID } = event;
  var k = function (k) { api.sendMessage(k, threadID)};

  const msg = args[0];
  let count = parseInt(args[1]);

  // Check if count is a valid number
  if (isNaN(count) || count <= 0) {
    return api.sendMessage(`❌ Invalid count! Please enter a number between 1 and 20.`, threadID, messageID);
  }

  // Silently limit spam to maximum 20 messages
  if (count > 20) {
    count = 20;
  }

  //*vonglap

for (i = 0; i < count; i++) {
 k(`${msg}`);
}

}
