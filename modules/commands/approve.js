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
    const { writeFileSync } = global.nodemodule["fs-extra"];
    const mention = Object.keys(mentions || {});
    delete require.cache[require.resolve(configPath)];
    var config = require(configPath);

    // Initialize APPROVAL system if not exists
    if (!config.APPROVAL) {
        config.APPROVAL = {
            approvedGroups: [],
            pendingGroups: [],
            rejectedGroups: []
        };
    }

    try {
        switch ((args[0] || "").toLowerCase()) {
            case "list":
            case "all":
            case "-a": {
                const approvedGroups = config.APPROVAL.approvedGroups || [];
                const pendingGroups = config.APPROVAL.pendingGroups || [];
                let msg = [];

                if (approvedGroups.length > 0) {
                    msg.push("✅ অনুমোদিত গ্রুপসমূহ:");
                    for (const id of approvedGroups) {
                        try {
                            const groupName = (await global.data.threadInfo.get(id)).threadName || "Unknown Group";
                            msg.push(`📌 গ্রুপ: ${groupName}\n🆔 আইডি: ${id}`);
                        } catch (e) {
                            msg.push(`📌 গ্রুপ: Unknown Group\n🆔 আইডি: ${id}`);
                        }
                    }
                }

                if (pendingGroups.length > 0) {
                    msg.push("\n⏳ অপেক্ষমাণ গ্রুপসমূহ:");
                    for (const id of pendingGroups) {
                        try {
                            const groupName = (await global.data.threadInfo.get(id)).threadName || "Unknown Group";
                            msg.push(`📌 গ্রুপ: ${groupName}\n🆔 আইডি: ${id}`);
                        } catch (e) {
                            msg.push(`📌 গ্রুপ: Unknown Group\n🆔 আইডি: ${id}`);
                        }
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
                if (content.length && !isNaN(content[0])) {
                    const targetThreadID = content[0];
                    
                    // Remove from pending if exists
                    if (config.APPROVAL.pendingGroups.includes(targetThreadID)) {
                        config.APPROVAL.pendingGroups = config.APPROVAL.pendingGroups.filter(id => id !== targetThreadID);
                    }
                    
                    // Remove from rejected if exists
                    if (config.APPROVAL.rejectedGroups && config.APPROVAL.rejectedGroups.includes(targetThreadID)) {
                        config.APPROVAL.rejectedGroups = config.APPROVAL.rejectedGroups.filter(id => id !== targetThreadID);
                    }
                    
                    // Add to approved if not already there
                    if (!config.APPROVAL.approvedGroups.includes(targetThreadID)) {
                        config.APPROVAL.approvedGroups.push(targetThreadID);
                    }
                    
                    writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                    
                    let displayInfo;
                    try {
                        const groupName = (await global.data.threadInfo.get(targetThreadID)).threadName || "Unknown Group";
                        displayInfo = `📌 গ্রুপ: ${groupName}\n🆔 আইডি: ${targetThreadID}`;
                    } catch (e) {
                        displayInfo = `📌 গ্রুপ: Unknown Group\n🆔 আইডি: ${targetThreadID}`;
                    }
                    
                    const addMsg = `✅ Approve সম্পন্ন!\n\n${displayInfo}\n\n👑 Crafted by TOHIDUL`;
                    
                    // Send activation message to the group
                    const activationMsg = `
╔════════════════════════════╗
  🎊 𝗕𝗢𝗧 𝗔𝗖𝗧𝗜𝗩𝗔𝗧𝗘𝗗 🎊
╚════════════════════════════╝

🤖 ${global.config.BOTNAME || 'TOHI-BOT'} এখন সক্রিয়!

🎉 এই গ্রুপ সফলভাবে অনুমোদিত হয়েছে!
✨ সব কমান্ড এখন কাজ করবে।

🚀 শুরু করতে:
┣━ ${global.config.PREFIX}help - সব কমান্ড দেখুন
┣━ ${global.config.PREFIX}menu - ক্যাটাগরি মেনু
┗━ ${global.config.PREFIX}info - বট তথ্য

────────────✦────────────
🚩 Made by TOHIDUL
────────────✦────────────`;

                    return api.sendMessage(activationMsg, targetThreadID, () => {
                        return api.sendMessage(addMsg, threadID, messageID);
                    });
                } else {
                    return api.sendMessage("❌ সঠিক threadID দিন! যেমন: /approve box 123456789", threadID, messageID);
                }
            }

            case "remove":
            case "rm":
            case "delete": {
                if (content.length && !isNaN(content[0])) {
                    const targetThreadID = content[0];
                    
                    // Remove from approved groups
                    const approvedIndex = config.APPROVAL.approvedGroups.findIndex(item => item.toString() === targetThreadID);
                    if (approvedIndex !== -1) {
                        config.APPROVAL.approvedGroups.splice(approvedIndex, 1);
                        
                        // Add to rejected list
                        if (!config.APPROVAL.rejectedGroups) config.APPROVAL.rejectedGroups = [];
                        if (!config.APPROVAL.rejectedGroups.includes(targetThreadID)) {
                            config.APPROVAL.rejectedGroups.push(targetThreadID);
                        }
                        
                        writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                        
                        let displayInfo;
                        try {
                            const groupName = (await global.data.threadInfo.get(targetThreadID)).threadName || "Unknown Group";
                            displayInfo = `📌 গ্রুপ: ${groupName}\n🆔 আইডি: ${targetThreadID}`;
                        } catch (e) {
                            displayInfo = `📌 গ্রুপ: Unknown Group\n🆔 আইডি: ${targetThreadID}`;
                        }
                        
                        const removeMsg = `🗑️ Remove সম্পন্ন!\n\n${displayInfo}\n\n👑 Crafted by TOHIDUL`;
                        
                        // Send rejection message to the group
                        const rejectionMsg = `
╔════════════════════════════╗
  ❌ 𝗚𝗥𝗢𝗨𝗣 𝗥𝗘𝗝𝗘𝗖𝗧𝗘𝗗 ❌
╚════════════════════════════╝

🚫 গ্রুপ প্রত্যাখ্যান করা হয়েছে।

⚠️ এই গ্রুপে বট কাজ করবে না।

────────────✦────────────
🚩 Made by TOHIDUL
────────────✦────────────`;

                        return api.sendMessage(rejectionMsg, targetThreadID, () => {
                            return api.sendMessage(removeMsg, threadID, messageID);
                        });
                    } else {
                        return api.sendMessage("❌ উক্ত আইডি Approve লিস্টে নেই!", threadID, messageID);
                    }
                } else {
                    return api.sendMessage("❌ সঠিক threadID দিন! যেমন: /approve remove 123456789", threadID, messageID);
                }
            }

            default: {
                const helpMsg = `
🤖 𝗔𝗽𝗽𝗿𝗼𝘃𝗲 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗛𝗲𝗹𝗽

📋 ব্যবহার পদ্ধতি:
┣━ /approve list - সব তালিকা দেখুন
┣━ /approve box [threadID] - গ্রুপ অনুমোদন
┗━ /approve remove [threadID] - গ্রুপ প্রত্যাখ্যান

📌 উদাহরণ:
┣━ /approve box 123456789
┗━ /approve remove 123456789

👑 Crafted by TOHIDUL`;
                return api.sendMessage(helpMsg, threadID, messageID);
            }
        }
    } catch (error) {
        return api.sendMessage("❌ কিছু একটা ভুল হয়েছে! আবার চেষ্টা করুন।", threadID, messageID);
    }
};