module.exports.config = {
    name: "approve",
    version: "3.0.0",
    permission: 2, // Only bot owner can use this command
    usePrefix: true,
    credits: "TOHI-BOT-HUB",
    description: "Auto-approve system for groups. Bot automatically approves when added to groups.",
    commandCategory: "Admin",
    usages: "approve [on|off|status|list]",
    cooldowns: 5
};

// Set your Facebook UID here (only you, the bot owner, can use this command)
const OWNER_ID = "100092006324917"; // Change this to your Facebook ID

module.exports.run = async function ({ api, event, args }) {
    if (event.senderID !== OWNER_ID) {
        return api.sendMessage(`⛔️ এই কমান্ডটি শুধু বট মালিক (${OWNER_ID}) ব্যবহার করতে পারবেন!`, event.threadID, event.messageID);
    }

    const { threadID, messageID } = event;
    const { configPath } = global.client;
    const { writeFileSync } = global.nodemodule["fs-extra"];
    delete require.cache[require.resolve(configPath)];
    var config = require(configPath);

    // Initialize AUTO_APPROVE system if not exists
    if (!config.AUTO_APPROVE) {
        config.AUTO_APPROVE = {
            enabled: true,
            approvedGroups: [],
            autoApproveMessage: true
        };
    }

    try {
        const command = (args[0] || "status").toLowerCase();

        switch (command) {
            case "on":
            case "enable": {
                config.AUTO_APPROVE.enabled = true;
                writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

                const enableMsg = `
╔════════════════════════════╗
  ✅ 𝗔𝗨𝗧𝗢 𝗔𝗣𝗣𝗥𝗢𝗩𝗘 𝗢𝗡 ✅
╚════════════════════════════╝

🤖 অটো এপ্রুভ সিস্টেম চালু করা হয়েছে!

📋 বৈশিষ্ট্য:
┣━ বট যেকোনো গ্রুপে যুক্ত হলে অটো এপ্রুভ
┣━ তাৎক্ষণিক কমান্ড অ্যাক্সেস
┣━ স্বয়ংক্রিয় স্বাগত বার্তা
┗━ কোনো ম্যানুয়াল এপ্রুভালের প্রয়োজন নেই

🎯 এখন বট যেকোনো গ্রুপে যুক্ত হলে তাৎক্ষণিক কাজ শুরু করবে!

────────────✦────────────
🚩 Made by TOHIDUL
────────────✦────────────`;

                return api.sendMessage(enableMsg, threadID, messageID);
            }

            case "off":
            case "disable": {
                config.AUTO_APPROVE.enabled = false;
                writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

                const disableMsg = `
╔════════════════════════════╗
  ❌ 𝗔𝗨𝗧𝗢 𝗔𝗣𝗣𝗥𝗢𝗩𝗘 𝗢𝗙𝗙 ❌
╚════════════════════════════╝

🔒 অটো এপ্রুভ সিস্টেম বন্ধ করা হয়েছে!

📋 পরিবর্তন:
┣━ নতুন গ্রুপে ম্যানুয়াল এপ্রুভাল প্রয়োজন
┣━ পুরাতন এপ্রুভড গ্রুপ এখনো কাজ করবে
┣━ নতুন গ্রুপে কমান্ড কাজ করবে না
┗━ এডমিনদের এপ্রুভাল দিতে হবে

⚠️ এখন নতুন গ্রুপে ম্যানুয়াল এপ্রুভাল প্রয়োজন!

────────────✦────────────
🚩 Made by TOHIDUL
────────────✦────────────`;

                return api.sendMessage(disableMsg, threadID, messageID);
            }

            case "list":
            case "groups": {
                const approvedGroups = config.AUTO_APPROVE.approvedGroups || [];
                if (approvedGroups.length === 0) {
                    return api.sendMessage("📋 কোনো গ্রুপ এপ্রুভড নেই!", threadID, messageID);
                }

                let groupsList = `
╔════════════════════════════╗
  📋 𝗔𝗣𝗣𝗥𝗢𝗩𝗘𝗗 𝗚𝗥𝗢𝗨𝗣𝗦 📋
╚════════════════════════════╝

🎉 মোট এপ্রুভড গ্রুপ: ${approvedGroups.length} টি

`;
                for (let i = 0; i < Math.min(approvedGroups.length, 15); i++) {
                    try {
                        const threadInfo = await api.getThreadInfo(approvedGroups[i]);
                        groupsList += `${i + 1}. ${threadInfo.threadName}\n   ID: ${approvedGroups[i]}\n   সদস্য: ${threadInfo.participantIDs.length} জন\n\n`;
                    } catch {
                        groupsList += `${i + 1}. Unknown Group\n   ID: ${approvedGroups[i]}\n\n`;
                    }
                }

                if (approvedGroups.length > 15) {
                    groupsList += `... এবং আরো ${approvedGroups.length - 15} টি গ্রুপ\n\n`;
                }

                groupsList += `────────────✦────────────\n🚩 Made by TOHIDUL\n────────────✦────────────`;
                return api.sendMessage(groupsList, threadID, messageID);
            }

            case "status":
            default: {
                const isEnabled = config.AUTO_APPROVE.enabled;
                const totalApproved = (config.AUTO_APPROVE.approvedGroups || []).length;

                const statusMsg = `
╔════════════════════════════╗
  📊 𝗔𝗨𝗧𝗢 𝗔𝗣𝗣𝗥𝗢𝗩𝗘 𝗦𝗧𝗔𝗧𝗨𝗦 📊
╚════════════════════════════╝

🔧 সিস্টেম স্ট্যাটাস: ${isEnabled ? '✅ চালু' : '❌ বন্ধ'}

📊 তথ্য:
┣━ এপ্রুভড গ্রুপ: ${totalApproved} টি
┣━ অটো এপ্রুভ: ${isEnabled ? 'সক্রিয় ✅' : 'নিষ্ক্রিয় ❌'}
┣━ স্বাগত বার্তা: ${config.AUTO_APPROVE.autoApproveMessage ? 'চালু ✅' : 'বন্ধ ❌'}
┗━ ম্যানুয়াল এপ্রুভাল: ${isEnabled ? 'প্রয়োজন নেই' : 'প্রয়োজন'}

🎯 কমান্ডসমূহ:
┣━ /approve on - অটো এপ্রুভ চালু
┣━ /approve off - অটো এপ্রুভ বন্ধ
┣━ /approve list - এপ্রুভড গ্রুপ দেখুন
┗━ /approve status - বর্তমান স্ট্যাটাস

${isEnabled ? 
'🎉 বট এখন যেকোনো গ্রুপে অটো এপ্রুভ করবে!' : 
'⚠️ নতুন গ্রুপে ম্যানুয়াল এপ্রুভাল প্রয়োজন!'}

────────────✦────────────
🚩 Made by TOHIDUL
────────────✦────────────`;

                return api.sendMessage(statusMsg, threadID, messageID);
            }
        }
    } catch (error) {
        console.error('Approve command error:', error);
        return api.sendMessage("❌ কিছু একটা ভুল হয়েছে! আবার চেষ্টা করুন।", threadID, messageID);
    }
};