module.exports.config = {
    name: "help",
    version: "1.0.6",
    hasPermssion: 0,
    credits: "TOHI-BOT-HUB",
    usePrefix: true,
    description: "Get all command list or module info",
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
═══════════════════════════════════════
        MODULE INFORMATION
═══════════════════════════════════════
Name: %1
Usage: %3
Description: %2
Category: %4
Cooldown: %5s
Permission: %6
Made by TOHIDUL`,
        "helpList": `Total %1 commands available!
TIP: Use %2help [command name] for details!`,
        "user": "User",
        "adminGroup": "Admin group",
        "adminBot": "Admin bot"
    }
};

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

    // all command group view
    if (args[0] == "all") {
        const cmds = commands.values();
        var group = [], msg = "";
        for (const commandConfig of cmds) {
            if (!group.some(item => item.group.toLowerCase() == commandConfig.config.commandCategory.toLowerCase()))
                group.push({ group: commandConfig.config.commandCategory.toLowerCase(), cmds: [commandConfig.config.name] });
            else
                group.find(item => item.group.toLowerCase() == commandConfig.config.commandCategory.toLowerCase()).cmds.push(commandConfig.config.name);
        }

        group.forEach(commandGroup => {
            msg += `\n═════════════════════\n`;
            msg += `【 ${commandGroup.group.toUpperCase()} 】\n`;
            msg += `${commandGroup.cmds.join(', ')}\n`;
        });

        const info = `═══════════════════════════════\n` +
                    `TOHI-BOT COMMAND LIST\n` +
                    `═══════════════════════════════${msg}\n` +
                    `═══════════════════════════════\n` +
                    `Total Commands: ${commands.size}\n` +
                    `Use ${prefix}help [name] for details\n` +
                    `Made by TOHIDUL`;

        api.sendMessage(info, threadID, (err, info) => {
            if (autoUnsend == false) {
                setTimeout(() => {
                    return api.unsendMessage(info.messageID);
                }, delayUnsend * 1000);
            }
        }, messageID);
        return;
    }

    // list or module/page help view
    if (!command) {
        const arrayInfo = [];
        const page = parseInt(args[0]) || 1;
        const numberOfOnePage = 20;
        let msg = "";

        for (var [name] of (commands)) {
            arrayInfo.push(name);
        }

        arrayInfo.sort();
        const first = numberOfOnePage * page - numberOfOnePage;
        const helpView = arrayInfo.slice(first, first + numberOfOnePage);

        for (let cmds of helpView) {
            msg += `${cmds}\n`;
        }

        const info = `═══════════════════════════════\n` +
                     `TOHI-BOT COMMAND LIST\n` +
                     `═══════════════════════════════\n` +
                     `${msg}` +
                     `═══════════════════════════════\n` +
                     `Page: [${page}/${Math.ceil(arrayInfo.length / numberOfOnePage)}]\n` +
                     `Total Commands: ${arrayInfo.length}\n` +
                     `Use ${prefix}help [name] for details\n` +
                     `Made by TOHIDUL`;

        api.sendMessage(info, threadID, (err, info) => {
            if (autoUnsend == false) {
                setTimeout(() => {
                    return api.unsendMessage(info.messageID);
                }, delayUnsend * 1000);
            }
        }, messageID);
        return;
    }

    // single module info
    let moduleInfo = `═══════════════════════════════\n`;
    moduleInfo += `COMMAND INFORMATION\n`;
    moduleInfo += `═══════════════════════════════\n`;
    moduleInfo += `Name: ${command.config.name}\n`;
    moduleInfo += `Description: ${command.config.description || 'No description available'}\n`;
    moduleInfo += `Usage: ${prefix}${command.config.name} ${(command.config.usages) ? command.config.usages : ""}\n`;
    moduleInfo += `Category: ${command.config.commandCategory}\n`;
    moduleInfo += `Cooldown: ${command.config.cooldowns}s\n`;
    moduleInfo += `Permission: ${((command.config.hasPermssion == 0) ? getText("user") : (command.config.hasPermssion == 1) ? getText("adminGroup") : getText("adminBot"))}\n`;
    moduleInfo += `Credits: ${command.config.credits}\n`;
    moduleInfo += `Made by TOHIDUL`;

    api.sendMessage(moduleInfo, threadID, (err, info) => {
        if (autoUnsend == false) {
            setTimeout(() => {
                return api.unsendMessage(info.messageID);
            }, delayUnsend * 1000);
        }
    }, messageID);
};