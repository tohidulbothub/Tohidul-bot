module.exports.config = {
    name: "approve",
    version: "2.0.1",
    permission: 2, // Only admins can use this command
    usePrefix: false,
    credits: "Tohidul",
    description: "Approve or remove threads/users using thread ID or mentions.",
    category: "code",
    usages: "approve [list | box | remove] [threadID | @mentions]",
    cooldowns: 5
};

module.exports.languages = {
    "vi": {
        "listAdmin": 'Danh sách toàn bộ người điều hành bot: \n\n%1',
        "notHavePermssion": 'Bạn không đủ quyền hạn để có thể sử dụng chức năng "%1"',
        "addedNewAdmin": 'Đã thêm %1 người dùng trở thành người điều hành bot:\n\n%2',
        "removedAdmin": 'Đã gỡ bỏ %1 người điều hành bot:\n\n%2'
    },
    "en": {
        "listAdmin": 'Approved list: \n\n%1',
        "notHavePermssion": 'You have no permission to use "%1"',
        "addedNewAdmin": 'Approved %1 box/user:\n\n%2',
        "removedAdmin": 'Removed %1 box/user from approved list:\n\n%2'
    }
};

module.exports.run = async function ({ api, event, args, Threads, Users, getText }) {
    // Check if the user is an admin
    if (!event.senderID || !(await api.getThreadInfo(event.threadID)).adminIDs.includes(event.senderID)) {
        return api.sendMessage("🚫 **Access Denied!** Only group admins can use this command! 😎", event.threadID, event.messageID);
    }

    const content = args.slice(1, args.length);
    const { threadID, messageID, mentions } = event;
    const { configPath } = global.client;
    const { APPROVED } = global.config;
    const { writeFileSync } = global.nodemodule["fs-extra"];
    const mention = Object.keys(mentions);
    delete require.cache[require.resolve(configPath)];
    var config = require(configPath);

    try {
        switch (args[0]) {
            case "list":
            case "all":
            case "-a": {
                const listAdmin = APPROVED || config.APPROVED || [];
                var msg = [];

                for (const idAdmin of listAdmin) {
                    if (parseInt(idAdmin)) {
                        let boxname;
                        try {
                            const groupName = await global.data.threadInfo.get(idAdmin).threadName || "Name does not exist";
                            boxname = `📌 **Group Name**: ${groupName}\n🆔 **Group ID**: ${idAdmin}`;
                        } catch (error) {
                            const userName = await Users.getNameUser(idAdmin);
                            boxname = `📛 **User Name**: ${userName}\n🆔 **User ID**: ${idAdmin}`;
                        }
                        msg.push(`\n${boxname}`);
                    }
                }

                const finalMsg = `╭───✨ **Approved List** ✨───╮\n` +
                                `│  📋 **Approved Groups/Users**  │\n` +
                                `╰────────────────────────╯\n\n${msg.join('\n')}\n\n` +
                                `╭───💡 **Crafted by Tohidul** 💡───╮\n` +
                                `╰─────────────────────────╯`;
                return api.sendMessage(finalMsg, threadID, messageID);
            }

            case "box": {
                if (mention.length != 0 && isNaN(content[0])) {
                    var listAdd = [];

                    for (const id of mention) {
                        APPROVED.push(id);
                        config.APPROVED.push(id);
                        listAdd.push(`📛 **User Name**: ${event.mentions[id]}\n🆔 **User ID**: ${id}`);
                    }

                    writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                    const addMsg = `╭───✨ **Approval Success** ✨───╮\n` +
                                  `│  ✅ **Approved ${mention.length} User(s)**  │\n` +
                                  `╰────────────────────────╯\n\n${listAdd.join("\n").replace(/\@/g, "")}\n\n` +
                                  `╭───💡 **Crafted by Tohidul** 💡───╮\n` +
                                  `╰─────────────────────────╯`;
                    return api.sendMessage(addMsg, threadID, messageID);
                } else if (content.length != 0 && !isNaN(content[0])) {
                    APPROVED.push(content[0]);
                    config.APPROVED.push(content[0]);

                    let boxname;
                    try {
                        const groupName = await global.data.threadInfo.get(content[0]).threadName || "Name does not exist";
                        boxname = `📌 **Group Name**: ${groupName}\n🆔 **Group ID**: ${content[0]}`;
                    } catch (error) {
                        const userName = await Users.getNameUser(content[0]);
                        boxname = `📛 **User Name**: ${userName}\n🆔 **User ID**: ${content[0]}`;
                    }

                    writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                    const addMsg = `╭───✨ **Approval Success** ✨───╮\n` +
                                  `│  ✅ **Box/User Approved**  │\n` +
                                  `╰────────────────────────╯\n\n${boxname}\n\n` +
                                  `╭───💡 **Crafted by Tohidul** 💡───╮\n` +
                                  `╰─────────────────────────╯`;
                    return api.sendMessage('✅ This box/user has been approved!', content[0], () => {
                        return api.sendMessage(addMsg, threadID, messageID);
                    });
                } else {
                    return api.sendMessage("❌ **Invalid Input!** 😓\nPlease provide a valid thread ID or mention a user.", threadID, messageID);
                }
            }

            case "remove":
            case "rm":
            case "delete": {
                if (mention.length != 0 && isNaN(content[0])) {
                    var listRemove = [];

                    for (const id of mention) {
                        const index = config.APPROVED.findIndex(item => item == id);
                        if (index !== -1) {
                            APPROVED.splice(index, 1);
                            config.APPROVED.splice(index, 1);
                            listRemove.push(`📛 **User Name**: ${event.mentions[id]}\n🆔 **User ID**: ${id}`);
                        }
                    }

                    writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                    const removeMsg = `╭───✨ **Removal Success** ✨───╮\n` +
                                     `│  🗑️ **Removed ${listRemove.length} User(s)**  │\n` +
                                     `╰────────────────────────╯\n\n${listRemove.join("\n").replace(/\@/g, "")}\n\n` +
                                     `╭───💡 **Crafted by Tohidul** 💡───╮\n` +
                                     `╰─────────────────────────╯`;
                    return api.sendMessage(removeMsg, threadID, messageID);
                } else if (content.length != 0 && !isNaN(content[0])) {
                    const index = config.APPROVED.findIndex(item => item.toString() == content[0]);
                    if (index !== -1) {
                        APPROVED.splice(index, 1);
                        config.APPROVED.splice(index, 1);

                        let boxname;
                        try {
                            const groupName = await global.data.threadInfo.get(content[0]).threadName || "Name does not exist";
                            boxname = `📌 **Group Name**: ${groupName}\n🆔 **Group ID**: ${content[0]}`;
                        } catch (error) {
                            const userName = await Users.getNameUser(content[0]);
                            boxname = `📛 **User Name**: ${userName}\n🆔 **User ID**: ${content[0]}`;
                        }

                        writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                        const removeMsg = `╭───✨ **Removal Success** ✨───╮\n` +
                                         `│  🗑️ **Box/User Removed**  │\n` +
                                         `╰────────────────────────╯\n\n${boxname}\n\n` +
                                         `╭───💡 **Crafted by Tohidul** 💡───╮\n` +
                                         `╰─────────────────────────╯`;
                        return api.sendMessage('🗑️ This box/user has been removed from the approved list!', content[0], () => {
                            return api.sendMessage(removeMsg, threadID, messageID);
                        });
                    } else {
                        return api.sendMessage("❌ **Not Found!** 😓\nThe specified thread/user ID is not in the approved list.", threadID, messageID);
                    }
                } else {
                    return api.sendMessage("❌ **Invalid Input!** 😓\nPlease provide a valid thread ID or mention a user.", threadID, messageID);
                }
            }

            default: {
                return api.sendMessage("❌ **Invalid Command!** 😓\nUse: approve [list | box | remove] [threadID | @mentions]", threadID, messageID);
            }
        }
    } catch (error) {
        return api.sendMessage("❌ **Oops! Something went wrong!** 😓\nFailed to process the command. Please try again later! 🚨", threadID, messageID);
    }
};
