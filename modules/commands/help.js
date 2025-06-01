
module.exports.config = {
    name: "help",
    version: "1.0.6",
    hasPermssion: 0,
    credits: "TOHI-BOT-HUB",
    usePrefix: true,
    description: "Get all command list or module info in a stylish way",
    commandCategory: "system",
    usages: "[command name/page/all]",
    cooldowns: 5,
    envConfig: {
        autoUnsend: true,
        delayUnsend: 20
    }
};

module.exports.languages = {
    "en": {
        "moduleInfo": `
╔═══════════════════════════════════════╗
        🌟 𝙏𝙊𝙃𝙄-𝘽𝙊𝙏 𝙈𝙊𝘿𝙐𝙇𝙀 𝙄𝙉𝙁𝙊 🌟
╚═══════════════════════════════════════╝
🔹 𝗡𝗮𝗺𝗲         : %1
🔸 𝗨𝘀𝗮𝗴𝗲        : %3
📝 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻   : %2
🌈 𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆     : %4
⏳ 𝗖𝗼𝗼𝗹𝗱𝗼𝘄𝗻     : %5s
🔑 𝗣𝗲𝗿𝗺𝗶𝘀𝘀𝗶𝗼𝗻   : %6
⚡️ 𝙈𝙖𝙙𝙚 𝙗𝙮 𝙏𝙊𝙃𝙄𝘿𝙐𝙇 | 𝙏𝙊𝙃𝙄-𝘽𝙊𝙏 ⚡️`,
        "helpList": `✨ 𝙏𝙊𝙃𝙄-𝘽𝙊𝙏-এ মোট %1টি কমান্ড আছে!
🔍 𝙏𝙄𝙋: %2help [কমান্ডনাম] লিখে বিস্তারিত জানুন!`,
        "user": "User",
        "adminGroup": "Admin group",
        "adminBot": "Admin bot"
    }
};

// Stylish font transformation functions
function toStylishFont(text) {
    if (!text || typeof text !== 'string') {
        return text || '';
    }
    const fontMap = {
        'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜',
        'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥',
        'S': '𝗦', 'T': '𝗧', 'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
        'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶',
        'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿',
        's': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
        '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
    };
    return text.split('').map(char => fontMap[char] || char).join('');
}

function toItalicFont(text) {
    if (!text || typeof text !== 'string') {
        return text || '';
    }
    const fontMap = {
        'A': '𝘈', 'B': '𝘉', 'C': '𝘊', 'D': '𝘋', 'E': '𝘌', 'F': '𝘍', 'G': '𝘎', 'H': '𝘏', 'I': '𝘐',
        'J': '𝘑', 'K': '𝘒', 'L': '𝘓', 'M': '𝘔', 'N': '𝘕', 'O': '𝘖', 'P': '𝘗', 'Q': '𝘘', 'R': '𝘙',
        'S': '𝘚', 'T': '𝘛', 'U': '𝘜', 'V': '𝘝', 'W': '𝘞', 'X': '𝘟', 'Y': '𝘠', 'Z': '𝘡',
        'a': '𝘢', 'b': '𝘣', 'c': '𝘤', 'd': '𝘥', 'e': '𝘦', 'f': '𝘧', 'g': '𝘨', 'h': '𝘩', 'i': '𝘪',
        'j': '𝘫', 'k': '𝘬', 'l': '𝘭', 'm': '𝘮', 'n': '𝘯', 'o': '𝘰', 'p': '𝘱', 'q': '𝘲', 'r': '𝘳',
        's': '𝘴', 't': '𝘵', 'u': '𝘶', 'v': '𝘷', 'w': '𝘸', 'x': '𝘹', 'y': '𝘺', 'z': '𝘻'
    };
    return text.split('').map(char => fontMap[char] || char).join('');
}

// Create decorative border
function createBorder(text, type = 'default') {
    const borders = {
        default: '═══════════════════════════════',
        double: '╔══════════════════════════════╗',
        star: '✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*',
        wave: '～～～～～～～～～～～～～～～～～～～～～～～～～～～～～～',
        diamond: '◆◇◆◇◆◇◆◇◆◇◆◇◆◇◆◇◆◇◆◇◆◇◆◇◆◇◆◇◆◇◆',
        heart: '💖💕💖💕💖💕💖💕💖💕💖💕💖💕💖💕💖',
        fire: '🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥'
    };
    return borders[type] || borders.default;
}

// Get category emoji
function getCategoryEmoji(category) {
    const emojis = {
        'system': '⚙️',
        'media': '🎵',
        'utility': '🛠️',
        'game': '🎮',
        'economy': '💰',
        'admin': '👑',
        'fun': '🎉',
        'image': '🖼️',
        'ai': '🤖',
        'social': '👥',
        'music': '🎵',
        'video': '📹'
    };
    return emojis[category.toLowerCase()] || '📝';
}

module.exports.handleEvent = function ({ api, event, getText }) {
    const { commands } = global.client;
    const { threadID, messageID, body } = event;

    if (!body || typeof body == "undefined" || body.indexOf("help") != 0) return;
    const splitBody = body.slice(body.indexOf("help")).trim().split(/\s+/);
    if (splitBody.length == 1 || !commands.has(splitBody[1].toLowerCase())) return;
    const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
    const command = commands.get(splitBody[1].toLowerCase());
    const prefix = (threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : global.config.PREFIX;
    return api.sendMessage(getText("moduleInfo", command.config.name, command.config.description, `${prefix}${command.config.name} ${(command.config.usages) ? command.config.usages : ""}`, command.config.commandCategory, command.config.cooldowns, ((command.config.hasPermssion == 0) ? getText("user") : (command.config.hasPermssion == 1) ? getText("adminGroup") : getText("adminBot")), command.config.credits), threadID, messageID);
}

module.exports.run = function ({ api, event, args, getText }) {
    const { commands } = global.client;
    const { threadID, messageID } = event;
    const command = commands.get((args[0] || "").toLowerCase());
    const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
    const { autoUnsend, delayUnsend } = global.configModule[this.config.name];
    const prefix = (threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : global.config.PREFIX;

    // --------- all command group view ----------
    if (args[0] == "all") {
        const cmds = commands.values();
        var group = [], msg = "";
        for (const commandConfig of cmds) {
            if (!group.some(item => item.group.toLowerCase() == commandConfig.config.commandCategory.toLowerCase()))
                group.push({ group: commandConfig.config.commandCategory.toLowerCase(), cmds: [commandConfig.config.name] });
            else
                group.find(item => item.group.toLowerCase() == commandConfig.config.commandCategory.toLowerCase()).cmds.push(commandConfig.config.name);
        }
        
        // Split groups into chunks for multiple messages
        const groupsPerMessage = 3; // Show 3 categories per message
        const totalGroups = group.length;
        const totalMessages = Math.ceil(totalGroups / groupsPerMessage);

        for (let messageIndex = 0; messageIndex < totalMessages; messageIndex++) {
            const startIndex = messageIndex * groupsPerMessage;
            const endIndex = Math.min(startIndex + groupsPerMessage, totalGroups);
            const currentGroups = group.slice(startIndex, endIndex);
            
            let msg = "";
            currentGroups.forEach(commandGroup => {
                const categoryEmoji = getCategoryEmoji(commandGroup.group);
                const categoryName = toStylishFont(commandGroup.group.charAt(0).toUpperCase() + commandGroup.group.slice(1));
                msg += `\n${categoryEmoji} ${categoryName}:\n`;
                // Show first 6 commands per category
                const limitedCmds = commandGroup.cmds.slice(0, 6);
                msg += `${limitedCmds.map(cmd => `• ${cmd}`).join(', ')}`;
                if (commandGroup.cmds.length > 6) {
                    msg += ` +${commandGroup.cmds.length - 6} more`;
                }
                msg += `\n`;
            });

            const fancy = `🌟 ${toStylishFont('TOHI-BOT COMMANDS')} 🌟\n` +
                         `═══════════════════════════════\n`;
            
            const info = `\n═══════════════════════════════\n` +
                        `📄 Part ${messageIndex + 1}/${totalMessages}\n` +
                        `📝 Total: ${commands.size} commands 💎\n` +
                        `ℹ️ Use ${prefix}help [name] for details\n` +
                        `🚩 Made by TOHIDUL`;

            // Add delay between messages to avoid spam
            setTimeout(() => {
                api.sendMessage(fancy + msg + info, threadID, (err, info) => {
                    if (autoUnsend == false) {
                        setTimeout(() => {
                            return api.unsendMessage(info.messageID);
                        }, delayUnsend * 1000);
                    }
                }, messageID);
            }, messageIndex * 1000); // 1 second delay between each message
        }
        return;
    }

    // ---------- list or module/page help view ----------
    if (!command) {
        const arrayInfo = [];
        const page = parseInt(args[0]) || 1;
        const numberOfOnePage = 15;
        let msg = "";

        for (var [name] of (commands)) {
            arrayInfo.push(name);
        }

        arrayInfo.sort();
        const first = numberOfOnePage * page - numberOfOnePage;
        const helpView = arrayInfo.slice(first, first + numberOfOnePage);

        for (let cmds of helpView) {
            msg += `⫸ ${toStylishFont('TBH')} ➤ 🔹 ${toItalicFont(cmds.toUpperCase())} ✨\n`;
        }
        
        const fancy = `${createBorder('', 'heart').substring(0, 40)}\n` +
                     `💫 ${toStylishFont('TOHI-BOT COMMAND LIST')} 💫\n` +
                     `${createBorder('', 'heart').substring(0, 40)}\n`;
        
        const info = `\n${createBorder('', 'diamond').substring(0, 35)}\n` +
                    `📃 ${toItalicFont('Page')}: [${toStylishFont(page.toString())}/${toStylishFont(Math.ceil(arrayInfo.length / numberOfOnePage).toString())}] 📄\n` +
                    `📝 ${toItalicFont('Total Commands')}: ${toStylishFont(arrayInfo.length.toString())} 🎯\n` +
                    `ℹ️ ${toItalicFont(`Use ${prefix}help [name] for command details`)} 📚\n` +
                    `${createBorder('', 'diamond').substring(0, 35)}\n` +
                    `🚩 ${toItalicFont('Made by TOHIDUL')}`;

        api.sendMessage(fancy + msg + info, threadID, (err, info) => {
            if (autoUnsend == false) {
                setTimeout(() => {
                    return api.unsendMessage(info.messageID);
                }, delayUnsend * 1000);
            }
        }, messageID);
        return;
    }

    // ---------- single module info ----------
    const categoryEmoji = getCategoryEmoji(command.config.commandCategory);
    
    let moduleInfo = `${createBorder('', 'double')}\n`;
    moduleInfo += `${categoryEmoji} ${toStylishFont('COMMAND INFORMATION')} ${categoryEmoji}\n`;
    moduleInfo += `${createBorder('', 'wave')}\n`;
    moduleInfo += `🔹 ${toItalicFont('Name')}: ${toStylishFont(command.config.name)} ✨\n`;
    moduleInfo += `📝 ${toItalicFont('Description')}: ${command.config.description || toItalicFont('No description available')} 📚\n`;
    moduleInfo += `🔸 ${toItalicFont('Usage')}: ${toStylishFont(`${prefix}${command.config.name} ${(command.config.usages) ? command.config.usages : ""}`)} 🎯\n`;
    moduleInfo += `🌈 ${toItalicFont('Category')}: ${toStylishFont(command.config.commandCategory)} ${categoryEmoji}\n`;
    moduleInfo += `⏳ ${toItalicFont('Cooldown')}: ${toStylishFont(command.config.cooldowns.toString())}s ⏰\n`;
    moduleInfo += `🔑 ${toItalicFont('Permission')}: ${toStylishFont(((command.config.hasPermssion == 0) ? getText("user") : (command.config.hasPermssion == 1) ? getText("adminGroup") : getText("adminBot")))} 👤\n`;
    moduleInfo += `${createBorder('', 'star')}\n`;
    moduleInfo += `⚡️ ${toItalicFont('Credits')}: ${toStylishFont(command.config.credits)} 🏆\n`;
    moduleInfo += `🚩 ${toItalicFont('Made by TOHIDUL')}`;

    api.sendMessage(moduleInfo, threadID, (err, info) => {
        if (autoUnsend == false) {
            setTimeout(() => {
                return api.unsendMessage(info.messageID);
            }, delayUnsend * 1000);
        }
    }, messageID);
};
