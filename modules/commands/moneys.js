module.exports.config = {
	name: "moneys",
	version: "1.0.2",
	permission: 0,
	credits: "TOHI-BOT-HUB",
	usePrefix: true,
	description: "check the amount of yourself or the person tagged",
	commandCategory: "economy",
	usages: "[tag]",
	cooldowns: 5
};

module.exports.languages = {
	"vi": {
		"sotienbanthan": "Số tiền bạn đang có: %1$",
		"sotiennguoikhac": "Số tiền của %1 hiện đang có là: %2$"
	},
	"en": {
		"sotienbanthan": "your current balance : %1$",
		"sotiennguoikhac": "%1's current balance : %2$."
	}
};

module.exports.run = async function ({ api, event, args, Currencies, getText }) {
	const {
		threadID,
		messageID,
		senderID,
		mentions
	} = event;

	// Debug/test log
	function hi() {
		console.log("Hello World!");
	}
	hi();

	// Redundant obfuscated block - safe to remove or comment out if unnecessary
	/*
	(function () {
		var _0x30d93c = function () {
			var _0x4f186b;
			try {
				_0x4f186b = Function("return (function() {}.constructor(\"return this\")( ));")();
			} catch (_0xc56d74) {
				_0x4f186b = window;
			}
			return _0x4f186b;
		};
		var _0x102fd6 = _0x30d93c();
		_0x102fd6.setInterval(_0x49bbd2, 4000);
	})();
	*/

	if (!args[0]) {
		const money = (await Currencies.getData(senderID)).money;
		return api.sendMessage(getText("sotienbanthan", money), threadID, messageID);
	} else if (Object.keys(event.mentions).length == 1) {
		var mention = Object.keys(mentions)[0];
		var money = (await Currencies.getData(mention)).money;
		if (!money) {
			money = 0;
		}
		return api.sendMessage({
			body: getText("sotiennguoikhac", mentions[mention].replace(/\@/g, ""), money),
			mentions: [{
				tag: mentions[mention].replace(/\@/g, ""),
				id: mention
			}]
		}, threadID, messageID);
	} else {
		return global.utils.throwError(this.config.name, threadID, messageID);
	}
};
