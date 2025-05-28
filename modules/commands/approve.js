module.exports.config = {
    name: "approve",
    version: "2.1.0",
    permission: 2, // Only bot owner can use this command
    usePrefix: true,
    credits: "TOHI-BOT-HUB",
    description: "Approve/remove threads or users by thread ID or mention. Only the bot owner can use.",
    commandCategory: "Admin",
    usages: "approve [list|box|remove] [threadID|@mentions]",
    cooldowns: 5
};

// Set your Facebook UID here (only you, the bot owner, can use this command)
const OWNER_ID = "100092006324917"; // Change this to your Facebook ID

module.exports.run = async function ({ api, event, args, Threads, Users }) {
    if (event.senderID !== OWNER_ID) {
        return api.sendMessage(`⛔️ এই কমান্ডটি শুধু বট মালিক (${OWNER_ID}) ব্যবহার করতে পারবেন!`, event.threadID, event.messageID);
    }

    const content = args.slice(1);
    const { threadID, messageID, mentions } = event;
    const { configPath } = global.client;
    const { APPROVED } = global.config;
    const { writeFileSync } = global.nodemodule["fs-extra"];
    const mention = Object.keys(mentions || {});
    delete require.cache[require.resolve(configPath)];
    var config = require(configPath);

    try {
        switch ((args[0] || "").toLowerCase()) {
            case "list":
            case "all":
            case "-a": {
                const approvedList = APPROVED || config.APPROVED || [];
                let msg = [];

                for (const id of approvedList) {
                    if (parseInt(id)) {
                        let displayInfo;
                        try {
                            const groupName = (await global.data.threadInfo.get(id)).threadName || "Unknown Group";
                            displayInfo = `📌 গ্রুপ: ${groupName}\n🆔 আইডি: ${id}`;
                        } catch (e) {
                            const userName = await Users.getNameUser(id);
                            displayInfo = `👤 ইউজার: ${userName}\n🆔 আইডি: ${id}`;
                        }
                        msg.push(displayInfo);
                    }
                }

                const finalMsg = 
`╭───🌟 𝗔𝗽𝗽𝗿𝗼𝘃𝗲𝗱 𝗟𝗶𝘀𝘁 🌟───╮
${msg.length ? msg.join('\n\n') : "কেউ নেই!"}
╰───────────────╯
👑 Crafted by TOHIDUL`;
                return api.sendMessage(finalMsg, threadID, messageID);
            }

            case "box": {
                if (mention.length && isNaN(content[0])) {
                    let listAdded = [];
                    for (const id of mention) {
                        if (!APPROVED.includes(id)) {
                            APPROVED.push(id);
                            config.APPROVED.push(id);
                        }
                        listAdded.push(`👤 ইউজার: ${event.mentions[id]}\n🆔 আইডি: ${id}`);
                    }
                    writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                    const addMsg = 
`✅ সফলভাবে ${listAdded.length} ইউজার Approve করা হয়েছে:

${listAdded.join("\n\n")}

👑 Crafted by TOHIDUL`;
                    return api.sendMessage(addMsg, threadID, messageID);
                } else if (content.length && !isNaN(content[0])) {
                    if (!APPROVED.includes(content[0])) {
                        APPROVED.push(content[0]);
                        config.APPROVED.push(content[0]);
                    }
                    let displayInfo;
                    try {
                        const groupName = (await global.data.threadInfo.get(content[0])).threadName || "Unknown Group";
                        displayInfo = `📌 গ্রুপ: ${groupName}\n🆔 আইডি: ${content[0]}`;
                    } catch (e) {
                        const userName = await Users.getNameUser(content[0]);
                        displayInfo = `👤 ইউজার: ${userName}\n🆔 আইডি: ${content[0]}`;
                    }
                    writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                    const addMsg = 
`✅ Approve সম্পন্ন!\n\n${displayInfo}\n\n👑 Crafted by TOHIDUL`;
                    return api.sendMessage('✅ এই বক্স/ইউজার Approve হয়েছে!', content[0], () => {
                        return api.sendMessage(addMsg, threadID, messageID);
                    });
                } else {
                    return api.sendMessage("❌ সঠিক threadID দিন অথবা কোনো ইউজারকে মেনশন করুন!", threadID, messageID);
                }
            }

            case "remove":
            case "rm":
            case "delete": {
                if (mention.length && isNaN(content[0])) {
                    let listRemoved = [];
                    for (const id of mention) {
                        const index = config.APPROVED.findIndex(item => item == id);
                        if (index !== -1) {
                            APPROVED.splice(index, 1);
                            config.APPROVED.splice(index, 1);
                            listRemoved.push(`👤 ইউজার: ${event.mentions[id]}\n🆔 আইডি: ${id}`);
                        }
                    }
                    writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                    const removeMsg = 
`🗑️ সফলভাবে ${listRemoved.length} ইউজার Remove করা হয়েছে:

${listRemoved.join('\n\n')}

👑 Crafted by TOHIDUL`;
                    return api.sendMessage(removeMsg, threadID, messageID);
                } else if (content.length && !isNaN(content[0])) {
                    const index = config.APPROVED.findIndex(item => item.toString() == content[0]);
                    if (index !== -1) {
                        APPROVED.splice(index, 1);
                        config.APPROVED.splice(index, 1);
                        let displayInfo;
                        try {
                            const groupName = (await global.data.threadInfo.get(content[0])).threadName || "Unknown Group";
                            displayInfo = `📌 গ্রুপ: ${groupName}\n🆔 আইডি: ${content[0]}`;
                        } catch (e) {
                            const userName = await Users.getNameUser(content[0]);
                            displayInfo = `👤 ইউজার: ${userName}\n🆔 আইডি: ${content[0]}`;
                        }
                        writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                        const removeMsg = 
`🗑️ Remove সম্পন্ন!\n\n${displayInfo}\n\n👑 Crafted by TOHIDUL`;
                        return api.sendMessage('🗑️ এই বক্স/ইউজার Approve লিস্ট থেকে Remove হয়েছে!', content[0], () => {
                            return api.sendMessage(removeMsg, threadID, messageID);
                        });
                    } else {
                        return api.sendMessage("❌ উক্ত আইডি Approve লিস্টে নেই!", threadID, messageID);
                    }
                } else {
                    return api.sendMessage("❌ সঠিক threadID দিন অথবা কোনো ইউজারকে মেনশন করুন!", threadID, messageID);
                }
            }

            default: {
                return api.sendMessage("❌ কমান্ড ভুল! approve [list|box|remove] [threadID|@mentions] ব্যবহার করুন।", threadID, messageID);
            }
        }
    } catch (error) {
        return api.sendMessage("❌ কিছু একটা ভুল হয়েছে! আবার চেষ্টা করুন।", threadID, messageID);
    }
};