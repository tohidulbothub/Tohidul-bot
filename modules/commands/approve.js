
module.exports.config = {
    name: "approve",
    version: "4.0.0",
    permission: 2,
    usePrefix: true,
    credits: "TOHI-BOT-HUB",
    description: "Complete approval management system - সব approval কাজ এক command দিয়ে করুন",
    commandCategory: "Admin",
    usages: "approve [list/pending/status/approve/reject] [threadID]",
    cooldowns: 5
};

// শুধু এই UID approval দিতে পারবে
const OWNER_ID = "100092006324917";

module.exports.handleReply = async function ({ api, event, handleReply }) {
    if (event.senderID !== OWNER_ID) {
        return api.sendMessage(`⛔️ শুধুমাত্র নির্দিষ্ট admin (${OWNER_ID}) approval দিতে পারবেন!`, event.threadID);
    }

    const { configPath } = global.client;
    const { writeFileSync } = global.nodemodule["fs-extra"];
    delete require.cache[require.resolve(configPath)];
    var config = require(configPath);

    const threadID = handleReply.threadID;
    const choice = event.body.toLowerCase().trim();

    if (choice === "yes" || choice === "y" || choice === "approve" || choice === "হ্যাঁ" || choice === "1") {
        // Approve the group
        if (!config.APPROVAL) {
            config.APPROVAL = {
                approvedGroups: [],
                pendingGroups: [],
                rejectedGroups: []
            };
        }

        if (!config.APPROVAL.approvedGroups.includes(threadID)) {
            config.APPROVAL.approvedGroups.push(threadID);
        }

        // Remove from pending and rejected
        if (config.APPROVAL.pendingGroups && config.APPROVAL.pendingGroups.includes(threadID)) {
            config.APPROVAL.pendingGroups = config.APPROVAL.pendingGroups.filter(id => id !== threadID);
        }
        if (config.APPROVAL.rejectedGroups && config.APPROVAL.rejectedGroups.includes(threadID)) {
            config.APPROVAL.rejectedGroups = config.APPROVAL.rejectedGroups.filter(id => id !== threadID);
        }

        writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

        try {
            const threadInfo = await api.getThreadInfo(threadID);
            const approvalMsg = `
╔════════════════════════════╗
  ✅ 𝗚𝗥𝗢𝗨𝗣 𝗔𝗣𝗣𝗥𝗢𝗩𝗘𝗗 ✅
╚════════════════════════════╝

🎉 আপনার গ্রুপ অনুমোদিত হয়েছে!

📊 গ্রুপ তথ্য:
┣━ নাম: ${threadInfo.threadName}
┣━ সদস্য: ${threadInfo.participantIDs.length} জন
┣━ স্ট্যাটাস: সক্রিয় ✅

🚀 এখন সব কমান্ড কাজ করবে:
┣━ ${global.config.PREFIX}help - সব কমান্ড
┣━ ${global.config.PREFIX}menu - মেনু
┣━ ${global.config.PREFIX}info - বট তথ্য
┗━ ${global.config.PREFIX}admin - এডমিন

────────────✦────────────
🚩 Made by TOHIDUL
────────────✦────────────`;

            api.sendMessage(approvalMsg, threadID);
            api.sendMessage(`✅ গ্রুপ "${threadInfo.threadName}" সফলভাবে approve করা হয়েছে!`, event.threadID, event.messageID);
        } catch (error) {
            api.sendMessage(`✅ গ্রুপ approve করা হয়েছে কিন্তু তথ্য পেতে সমস্যা হয়েছে।`, event.threadID, event.messageID);
        }

    } else if (choice === "no" || choice === "n" || choice === "reject" || choice === "না" || choice === "2") {
        // Reject the group
        if (!config.APPROVAL.rejectedGroups) {
            config.APPROVAL.rejectedGroups = [];
        }

        if (!config.APPROVAL.rejectedGroups.includes(threadID)) {
            config.APPROVAL.rejectedGroups.push(threadID);
        }

        // Remove from pending and approved
        if (config.APPROVAL.pendingGroups && config.APPROVAL.pendingGroups.includes(threadID)) {
            config.APPROVAL.pendingGroups = config.APPROVAL.pendingGroups.filter(id => id !== threadID);
        }
        if (config.APPROVAL.approvedGroups && config.APPROVAL.approvedGroups.includes(threadID)) {
            config.APPROVAL.approvedGroups = config.APPROVAL.approvedGroups.filter(id => id !== threadID);
        }

        writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

        try {
            const threadInfo = await api.getThreadInfo(threadID);
            const rejectedMsg = `
╔════════════════════════════╗
  ❌ 𝗚𝗥𝗢𝗨𝗣 𝗥𝗘𝗝𝗘𝗖𝗧𝗘𝗗 ❌
╚════════════════════════════╝

🚫 আপনার গ্রুপ reject করা হয়েছে!

📊 গ্রুপ তথ্য:
┣━ নাম: ${threadInfo.threadName}
┣━ স্ট্যাটাস: অনুমোদিত নয় ❌

⚠️ এই গ্রুপে কোনো কমান্ড কাজ করবে না।

────────────✦────────────
🚩 Made by TOHIDUL
────────────✦────────────`;

            api.sendMessage(rejectedMsg, threadID);
            api.sendMessage(`❌ গ্রুপ "${threadInfo.threadName}" reject করা হয়েছে!`, event.threadID, event.messageID);
        } catch (error) {
            api.sendMessage(`❌ গ্রুপ reject করা হয়েছে!`, event.threadID, event.messageID);
        }
    } else {
        api.sendMessage(`❓ অবৈধ উত্তর! "1" (approve) বা "2" (reject) লিখুন।`, event.threadID, event.messageID);
    }
};

module.exports.run = async function ({ api, event, args }) {
    if (event.senderID !== OWNER_ID) {
        return api.sendMessage(`⛔️ শুধুমাত্র নির্দিষ্ট admin (${OWNER_ID}) approval দিতে পারবেন!`, event.threadID, event.messageID);
    }

    const { threadID, messageID } = event;
    const { configPath } = global.client;
    const { writeFileSync } = global.nodemodule["fs-extra"];
    delete require.cache[require.resolve(configPath)];
    var config = require(configPath);

    // Initialize APPROVAL system
    if (!config.APPROVAL) {
        config.APPROVAL = {
            approvedGroups: [],
            pendingGroups: [],
            rejectedGroups: []
        };
        writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    }

    // Turn off AUTO_APPROVE system
    if (!config.AUTO_APPROVE) {
        config.AUTO_APPROVE = {
            enabled: false,
            approvedGroups: [],
            autoApproveMessage: false
        };
    } else {
        config.AUTO_APPROVE.enabled = false;
    }

    writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

    try {
        const command = (args[0] || "status").toLowerCase();

        switch (command) {
            case "list":
            case "pending": {
                const pendingGroups = config.APPROVAL.pendingGroups || [];
                
                if (pendingGroups.length === 0) {
                    return api.sendMessage(`
╔════════════════════════════╗
  📋 𝗣𝗘𝗡𝗗𝗜𝗡𝗚 𝗟𝗜𝗦𝗧 📋
╚════════════════════════════╝

📭 কোনো pending গ্রুপ নেই!

🎯 Commands:
┣━ /approve status - সিস্টেম স্ট্যাটাস
┣━ /approve all - সব তালিকা
┗━ /approve help - সাহায্য

────────────✦────────────
🚩 Made by TOHIDUL
────────────✦────────────`, threadID, messageID);
                }

                let listMsg = `
╔════════════════════════════╗
  📋 𝗣𝗘𝗡𝗗𝗜𝗡𝗚 𝗚𝗥𝗢𝗨𝗣𝗦 📋
╚════════════════════════════╝

📭 Pending গ্রুপ: ${pendingGroups.length} টি

`;

                for (let i = 0; i < Math.min(pendingGroups.length, 10); i++) {
                    try {
                        const threadInfo = await api.getThreadInfo(pendingGroups[i]);
                        listMsg += `${i + 1}. ${threadInfo.threadName}\n   ID: ${pendingGroups[i]}\n   সদস্য: ${threadInfo.participantIDs.length} জন\n\n`;
                    } catch {
                        listMsg += `${i + 1}. [তথ্য পাওয়া যায়নি]\n   ID: ${pendingGroups[i]}\n\n`;
                    }
                }

                listMsg += `
🎯 Approve করতে: /approve ${pendingGroups[0]}

────────────✦────────────
🚩 Made by TOHIDUL
────────────✦────────────`;

                return api.sendMessage(listMsg, threadID, messageID);
            }

            case "all":
            case "status": {
                const pendingGroups = config.APPROVAL.pendingGroups || [];
                const approvedGroups = config.APPROVAL.approvedGroups || [];
                const rejectedGroups = config.APPROVAL.rejectedGroups || [];

                const statusMsg = `
╔════════════════════════════╗
  📊 𝗔𝗣𝗣𝗥𝗢𝗩𝗔𝗟 𝗦𝗧𝗔𝗧𝗨𝗦 📊
╚════════════════════════════╝

📊 সিস্টেম তথ্য:
┣━ Pending: ${pendingGroups.length} টি গ্রুপ
┣━ Approved: ${approvedGroups.length} টি গ্রুপ
┣━ Rejected: ${rejectedGroups.length} টি গ্রুপ
┗━ Manual Approval: সক্রিয় ✅

👤 Approval Admin: ${OWNER_ID}

🎯 Commands:
┣━ /approve pending - pending তালিকা
┣━ /approve [threadID] - approve করুন
┣━ /approve reject [threadID] - reject করুন
┗━ Reply "1/2" দিয়ে approve/reject

────────────✦────────────
🚩 Made by TOHIDUL
────────────✦────────────`;

                return api.sendMessage(statusMsg, threadID, messageID);
            }

            case "reject": {
                const targetThreadID = args[1];
                if (!targetThreadID) {
                    return api.sendMessage("❌ Thread ID দিন! উদাহরণ: /approve reject 123456789", threadID, messageID);
                }

                // Add to rejected list
                if (!config.APPROVAL.rejectedGroups.includes(targetThreadID)) {
                    config.APPROVAL.rejectedGroups.push(targetThreadID);
                }

                // Remove from other lists
                config.APPROVAL.pendingGroups = config.APPROVAL.pendingGroups.filter(id => id !== targetThreadID);
                config.APPROVAL.approvedGroups = config.APPROVAL.approvedGroups.filter(id => id !== targetThreadID);

                writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

                try {
                    const threadInfo = await api.getThreadInfo(targetThreadID);
                    api.sendMessage(`❌ গ্রুপ "${threadInfo.threadName}" reject করা হয়েছে!`, threadID, messageID);
                } catch {
                    api.sendMessage(`❌ গ্রুপ (${targetThreadID}) reject করা হয়েছে!`, threadID, messageID);
                }
                break;
            }

            case "help": {
                const helpMsg = `
╔════════════════════════════╗
  ℹ️ 𝗔𝗣𝗣𝗥𝗢𝗩𝗔𝗟 𝗛𝗘𝗟𝗣 ℹ️
╚════════════════════════════╝

🎯 সব Commands:

📋 তালিকা দেখুন:
┣━ /approve status - সিস্টেম স্ট্যাটাস
┣━ /approve pending - pending গ্রুপ
┗━ /approve all - সব তালিকা

✅ Approve করুন:
┣━ /approve [threadID] - approve
┣━ Reply "1" বা "yes" - approve
┗━ Direct approve from notification

❌ Reject করুন:
┣━ /approve reject [threadID] - reject
┣━ Reply "2" বা "no" - reject
┗━ Direct reject from notification

🔧 সিস্টেম:
┣━ Manual approval সক্রিয়
┣━ Auto notification চালু
┗━ শুধু ${OWNER_ID} approve করতে পারে

────────────✦────────────
🚩 Made by TOHIDUL
────────────✦────────────`;

                return api.sendMessage(helpMsg, threadID, messageID);
            }

            default: {
                // Direct approve by threadID
                const targetThreadID = args[0];
                if (!targetThreadID) {
                    return api.sendMessage("❌ Thread ID দিন! উদাহরণ: /approve 123456789", threadID, messageID);
                }

                // Check if already approved
                if (config.APPROVAL.approvedGroups.includes(targetThreadID)) {
                    return api.sendMessage("✅ এই গ্রুপ ইতিমধ্যে approved!", threadID, messageID);
                }

                // Add to approved list
                if (!config.APPROVAL.approvedGroups.includes(targetThreadID)) {
                    config.APPROVAL.approvedGroups.push(targetThreadID);
                }

                // Remove from other lists
                config.APPROVAL.pendingGroups = config.APPROVAL.pendingGroups.filter(id => id !== targetThreadID);
                config.APPROVAL.rejectedGroups = config.APPROVAL.rejectedGroups.filter(id => id !== targetThreadID);

                writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

                try {
                    const threadInfo = await api.getThreadInfo(targetThreadID);
                    
                    const approvalMsg = `
╔════════════════════════════╗
  ✅ 𝗚𝗥𝗢𝗨𝗣 𝗔𝗣𝗣𝗥𝗢𝗩𝗘𝗗 ✅
╚════════════════════════════╝

🎉 আপনার গ্রুপ অনুমোদিত হয়েছে!

📊 গ্রুপ তথ্য:
┣━ নাম: ${threadInfo.threadName}
┣━ সদস্য: ${threadInfo.participantIDs.length} জন
┣━ স্ট্যাটাস: সক্রিয় ✅

🚀 এখন সব কমান্ড কাজ করবে!

────────────✦────────────
🚩 Made by TOHIDUL
────────────✦────────────`;

                    api.sendMessage(approvalMsg, targetThreadID);
                    api.sendMessage(`✅ গ্রুপ "${threadInfo.threadName}" সফলভাবে approve করা হয়েছে!`, threadID, messageID);
                } catch {
                    api.sendMessage(`✅ গ্রুপ (${targetThreadID}) approve করা হয়েছে!`, threadID, messageID);
                }
                break;
            }
        }
    } catch (error) {
        console.error('Approve command error:', error);
        return api.sendMessage("❌ কিছু একটা ভুল হয়েছে! আবার চেষ্টা করুন।", threadID, messageID);
    }
};
