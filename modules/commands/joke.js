
module.exports.config = {
	name: "joke",
	version: "1.0.0",
	permission: 0,
	credits: "TOHI-BOT-HUB",
	description: "Get a random joke to brighten your day",
	usePrefix: true,
	commandCategory: "fun",
	usages: "joke",
	cooldowns: 3
};

module.exports.languages = {
	"vi": {
		"loading": "Đang tải joke...",
		"error": "Không thể tải joke, vui lòng thử lại sau!",
		"jokeTitle": "🤣 JOKE CỦA NGÀY 🤣"
	},
	"en": {
		"loading": "Loading joke...",
		"error": "Could not fetch joke, please try again later!",
		"jokeTitle": "🤣 JOKE OF THE DAY 🤣"
	}
};

module.exports.run = async function({ api, event, getText }) {
	const { threadID, messageID } = event;
	
	try {
		// Send loading message
		const loadingMsg = await api.sendMessage(getText("loading"), threadID);
		
		// Fetch joke from API
		const axios = require("axios");
		const response = await axios.get("https://official-joke-api.appspot.com/random_joke");
		
		if (response.data && response.data.setup && response.data.punchline) {
			const joke = response.data;
			
			const message = `${getText("jokeTitle")}\n\n` +
				`📝 ${joke.setup}\n\n` +
				`💡 ${joke.punchline}\n\n` +
				`📂 Category: ${joke.type || "General"}\n` +
				`🆔 ID: ${joke.id || "Unknown"}`;
			
			// Delete loading message and send joke
			api.unsendMessage(loadingMsg.messageID);
			return api.sendMessage(message, threadID, messageID);
			
		} else {
			// Fallback jokes if API fails
			const fallbackJokes = [
				{
					setup: "Why don't scientists trust atoms?",
					punchline: "Because they make up everything!"
				},
				{
					setup: "Why did the scarecrow win an award?",
					punchline: "Because he was outstanding in his field!"
				},
				{
					setup: "Why don't eggs tell jokes?",
					punchline: "They'd crack each other up!"
				},
				{
					setup: "What do you call a fake noodle?",
					punchline: "An impasta!"
				},
				{
					setup: "Why did the math book look so sad?",
					punchline: "Because it was full of problems!"
				}
			];
			
			const randomJoke = fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
			
			const message = `${getText("jokeTitle")}\n\n` +
				`📝 ${randomJoke.setup}\n\n` +
				`💡 ${randomJoke.punchline}\n\n` +
				`📂 Category: Fallback Jokes`;
			
			api.unsendMessage(loadingMsg.messageID);
			return api.sendMessage(message, threadID, messageID);
		}
		
	} catch (error) {
		console.error("Joke command error:", error);
		return api.sendMessage(getText("error"), threadID, messageID);
	}
};
