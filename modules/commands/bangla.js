
module.exports.config = {
	name: "bangla",
	version: "2.0.0",
	permission: 0,
	credits: "TOHI-BOT-HUB",
	usePrefix: true,
	description: "🌐 Advanced Bengali translator with multiple language support",
	commandCategory: "utility",
	usages: "[text] or [text] -> [language_code] or reply to message",
	cooldowns: 3
};

module.exports.languages = {
	"en": {
		"missingInput": "❌ Please provide text to translate or reply to a message\n\n📝 Usage:\n• /bangla [text] - Translate to Bengali\n• /bangla [text] -> [language] - Translate to specific language\n• Reply to message with /bangla",
		"translateError": "❌ Translation failed! Please check your internet connection and try again.",
		"invalidLanguage": "❌ Invalid language code! Use codes like: en, hi, ar, ur, etc."
	},
	"vi": {
		"missingInput": "❌ Vui lòng cung cấp văn bản để dịch hoặc trả lời tin nhắn\n\n📝 Sử dụng:\n• /bangla [văn bản] - Dịch sang tiếng Bengali\n• /bangla [văn bản] -> [ngôn ngữ] - Dịch sang ngôn ngữ cụ thể",
		"translateError": "❌ Dịch thất bại! Vui lòng kiểm tra kết nối internet và thử lại.",
		"invalidLanguage": "❌ Mã ngôn ngữ không hợp lệ! Sử dụng mã như: en, hi, ar, ur, v.v."
	}
};

module.exports.run = async ({ api, event, args, getText }) => {
	const axios = require("axios");
	let content = args.join(" ");
	
	// Check if no input and not a reply
	if (content.length == 0 && event.type != "message_reply") {
		return api.sendMessage(getText("missingInput"), event.threadID, event.messageID);
	}
	
	let translateThis = "";
	let targetLang = "bn"; // Default to Bengali
	let sourceLang = "auto";
	
	// Handle reply to message
	if (event.type == "message_reply") {
		translateThis = event.messageReply.body;
		
		// Check if user specified target language in reply
		if (content.includes(" -> ")) {
			targetLang = content.split(" -> ")[1].trim();
		} else if (content.includes("->")) {
			targetLang = content.split("->")[1].trim();
		} else if (args.length > 0) {
			targetLang = args[0];
		}
	} 
	// Handle direct text with language specification
	else if (content.includes(" -> ")) {
		const parts = content.split(" -> ");
		translateThis = parts[0].trim();
		targetLang = parts[1].trim();
	} else if (content.includes("->")) {
		const parts = content.split("->");
		translateThis = parts[0].trim();
		targetLang = parts[1].trim();
	} 
	// Handle direct text (translate to Bengali by default)
	else {
		translateThis = content;
	}
	
	// Validate input
	if (!translateThis || translateThis.trim() === "") {
		return api.sendMessage(getText("missingInput"), event.threadID, event.messageID);
	}
	
	// Language code mapping for better user experience
	const languageMap = {
		"english": "en",
		"hindi": "hi", 
		"urdu": "ur",
		"arabic": "ar",
		"spanish": "es",
		"french": "fr",
		"german": "de",
		"chinese": "zh",
		"japanese": "ja",
		"korean": "ko",
		"russian": "ru",
		"portuguese": "pt",
		"italian": "it",
		"dutch": "nl",
		"bangla": "bn",
		"bengali": "bn"
	};
	
	// Convert language name to code if needed
	if (languageMap[targetLang.toLowerCase()]) {
		targetLang = languageMap[targetLang.toLowerCase()];
	}
	
	// Validate language code (basic check)
	if (targetLang.length > 3) {
		return api.sendMessage(getText("invalidLanguage"), event.threadID, event.messageID);
	}
	
	try {
		// Send processing message
		const processingMsg = await api.sendMessage("🔄 Translating... Please wait!", event.threadID);
		
		// Make translation request
		const response = await axios.get(
			`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(translateThis)}`,
			{ timeout: 10000 }
		);
		
		if (!response.data || !response.data[0]) {
			throw new Error("Invalid response from translation service");
		}
		
		// Parse translation result
		let translatedText = '';
		response.data[0].forEach(item => {
			if (item[0]) translatedText += item[0];
		});
		
		// Get detected source language
		let detectedLang = response.data[2] || "unknown";
		if (response.data[8] && response.data[8][0] && response.data[8][0][0]) {
			detectedLang = response.data[8][0][0];
		}
		
		// Language names for display
		const langNames = {
			"en": "English",
			"bn": "Bengali (বাংলা)",
			"hi": "Hindi (हिन्दी)",
			"ur": "Urdu (اردو)",
			"ar": "Arabic (العربية)",
			"es": "Spanish",
			"fr": "French",
			"de": "German",
			"zh": "Chinese",
			"ja": "Japanese",
			"ko": "Korean",
			"ru": "Russian",
			"pt": "Portuguese",
			"it": "Italian",
			"auto": "Auto-detected"
		};
		
		const sourceLangName = langNames[detectedLang] || detectedLang.toUpperCase();
		const targetLangName = langNames[targetLang] || targetLang.toUpperCase();
		
		// Format the response message
		const resultMessage = `🌐 **Translation Complete!**\n\n` +
			`📝 **Original Text:**\n"${translateThis}"\n\n` +
			`✨ **Translated Text:**\n"${translatedText}"\n\n` +
			`🔄 **Translation:** ${sourceLangName} → ${targetLangName}\n` +
			`⏱️ **Processed by:** TOHI-BOT-HUB\n\n` +
			`💡 **Tip:** Use /bangla [text] -> [language_code] for other languages`;
		
		// Delete processing message and send result
		api.unsendMessage(processingMsg.messageID);
		return api.sendMessage(resultMessage, event.threadID, event.messageID);
		
	} catch (error) {
		console.error("Translation error:", error);
		
		// Delete processing message if it exists
		try {
			if (processingMsg && processingMsg.messageID) {
				api.unsendMessage(processingMsg.messageID);
			}
		} catch (e) {}
		
		// Send error message with suggestions
		const errorMsg = `${getText("translateError")}\n\n` +
			`🔧 **Troubleshooting:**\n` +
			`• Check your internet connection\n` +
			`• Try shorter text\n` +
			`• Verify language code (e.g., en, hi, ar)\n` +
			`• Contact admin if problem persists`;
			
		return api.sendMessage(errorMsg, event.threadID, event.messageID);
	}
};
