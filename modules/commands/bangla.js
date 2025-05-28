
module.exports.config = {
	name: "bangla",
	version: "1.0.1",
	permission: 0,
	credits: "TOHI-BOT-HUB",
	usePrefix: true,
	description: "Translate text to Bengali or any language",
	commandCategory: "utility",
	usages: "[text] or [text] -> [language_code] or reply to message",
	cooldowns: 5
};

module.exports.languages = {
	"en": {
		"missingInput": "Please provide text to translate or reply to a message\nUsage: /bangla [text] or /bangla [text] -> [language_code]",
		"translateError": "Translation failed, please try again"
	},
	"vi": {
		"missingInput": "Vui lòng cung cấp văn bản để dịch hoặc trả lời tin nhắn\nSử dụng: /bangla [văn bản] hoặc /bangla [văn bản] -> [mã ngôn ngữ]",
		"translateError": "Dịch thất bại, vui lòng thử lại"
	}
};

module.exports.run = async ({ api, event, args, getText }) => {
	const request = global.nodemodule["request"];
	var content = args.join(" ");
	
	if (content.length == 0 && event.type != "message_reply") {
		return api.sendMessage(getText("missingInput"), event.threadID, event.messageID);
	}
	
	var translateThis = content.slice(0, content.indexOf(" ->"));
	var lang = content.substring(content.indexOf(" -> ") + 4);
	
	if (event.type == "message_reply") {
		translateThis = event.messageReply.body;
		if (content.indexOf("-> ") !== -1) {
			lang = content.substring(content.indexOf("-> ") + 3);
		} else {
			lang = 'bn'; // Default to Bengali
		}
	} else if (content.indexOf(" -> ") == -1) {
		translateThis = content.slice(0, content.length);
		lang = 'bn'; // Default to Bengali
	}
	
	if (!translateThis || translateThis.trim() === "") {
		return api.sendMessage(getText("missingInput"), event.threadID, event.messageID);
	}
	
	return request(encodeURI(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${translateThis}`), (err, response, body) => {
		if (err) {
			return api.sendMessage(getText("translateError"), event.threadID, event.messageID);
		}
		
		try {
			var retrieve = JSON.parse(body);
			var text = '';
			retrieve[0].forEach(item => (item[0]) ? text += item[0] : '');
			var fromLang = (retrieve[2] === retrieve[8][0][0]) ? retrieve[2] : retrieve[8][0][0];
			
			api.sendMessage(`📝 Translation Result:\n\n${text}\n\n🔄 Translated from ${fromLang} to ${lang}`, event.threadID, event.messageID);
		} catch (parseError) {
			return api.sendMessage(getText("translateError"), event.threadID, event.messageID);
		}
	});
};
