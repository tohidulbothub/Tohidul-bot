module.exports.config = {
	name: "uid",
	version: "1.0.0",
	permission: 0,
	credits: "TOHI-BOT-HUB",
	usePrefix: true,
	description: "get user id.",
	commandCategory: "utility",
	cooldowns: 5
};

module.exports.run = function({ api, event }) {
	if (Object.keys(event.mentions) == 0) return api.sendMessage(`${event.senderID}`, event.threadID, event.messageID);
	else {
		for (var i = 0; i < Object.keys(event.mentions).length; i++) api.sendMessage(`${Object.values(event.mentions)[i].replace('@', '')}: ${Object.keys(event.mentions)[i]}`, event.threadID);
		return;
	}
}