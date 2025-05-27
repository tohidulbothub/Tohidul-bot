module.exports.config = {
	name: "restart",
	version: "7.0.0",
	permission: 2,
	credits: "TOHI-BOT-HUB",
	usePrefix: false,
	description: "restart bot system",
	commandCategory: "admin",
	usages: "",
	cooldowns: 0,
	dependencies: {
		"process": ""
	}
};
module.exports.run = async function({ api, event, args, Threads, Users, Currencies, models }) {
  const process = require("process");
  const { threadID, messageID } = event;
  api.sendMessage(`restarting ${global.config.BOTNAME} ai, please be patient.`, threadID, ()=> process.exit(1));
}
