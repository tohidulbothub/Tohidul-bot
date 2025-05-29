
module.exports.config = {
    name: "approve",
    version: "3.0.0",
    permission: 2,
    usePrefix: true,
    credits: "TOHI-BOT-HUB",
    description: "Manual approval system - শুধু নির্দিষ্ট admin approval দিতে পারবেন",
    commandCategory: "Admin",
    usages: "approve [threadID] বা reply দিয়ে approve করুন",
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

    if (choice === "yes" || choice === "y" || choice === "approve" || choice === "হ্যাঁ") {
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

        // Remove from pending if exists
        if (config.APPROVAL.pendingGroups && config.APPROVAL.pendingGroups.includes(threadID)) {
            config.APPROVAL.pendingGroups = config.APPROVAL.pendingGroups.filter(id => id !== threadID);
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

    } else if (choice === "no" || choice === "n" || choice === "reject" || choice === "না") {
        // Reject the group
        if (!config.APPROVAL.rejectedGroups) {
            config.APPROVAL.rejectedGroups = [];
        }

        if (!config.APPROVAL.rejectedGroups.includes(threadID)) {
            config.APPROVAL.rejectedGroups.push(threadID);
        }

        // Remove from pending if exists
        if (config.APPROVAL.pendingGroups && config.APPROVAL.pendingGroups.includes(threadID)) {
            config.APPROVAL.pendingGroups = config.APPROVAL.pendingGroups.filter(id => id !== threadID);
        }

        writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

        try {
            const threadInfo = await api.getThreadInfo(threadID);
            api.sendMessage(`❌ গ্রুপ "${threadInfo.threadName}" reject করা হয়েছে!`, event.threadID, event.messageID);
        } catch (error) {
            api.sendMessage(`❌ গ্রুপ reject করা হয়েছে!`, event.threadID, event.messageID);
        }
    } else {
        api.sendMessage(`❓ অবৈধ উত্তর! "yes" বা "no" লিখুন।`, event.threadID, event.messageID);
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

        if (command === "list" || command === "pending") {
            const pendingGroups = config.APPROVAL.pendingGroups || [];
            const approvedGroups = config.APPROVAL.approvedGroups || [];

            let statusMsg = `
╔════════════════════════════╗
  📊 𝗔𝗣𝗣𝗥𝗢𝗩𝗔𝗟 𝗦𝗧𝗔𝗧𝗨𝗦 📊
╚════════════════════════════╝

📋 Pending গ্রুপ: ${pendingGroups.length} টি
📋 Approved গ্রুপ: ${approvedGroups.length} টি

🔒 Manual Approval System চালু আছে
👤 Approval Admin: ${OWNER_ID}

────────────✦────────────
🚩 Made by TOHIDUL
────────────✦────────────`;

            return api.sendMessage(statusMsg, threadID, messageID);
        } else {
            const statusMsg = `
╔════════════════════════════╗
  ⚙️ 𝗠𝗔𝗡𝗨𝗔𝗟 𝗔𝗣𝗣𝗥𝗢𝗩𝗔𝗟 ⚙️
╚════════════════════════════╝

🔒 Manual Approval System সক্রিয়!

📋 বৈশিষ্ট্য:
┣━ নতুন গ্রুপে notification পাবেন
┣━ Reply দিয়ে approve/reject করুন
┣━ শুধু আপনি approval দিতে পারবেন
┗━ Unapproved গ্রুপে কমান্ড কাজ করবে না

👤 Approval Admin: ${OWNER_ID}

🎯 Commands:
┣━ /approve list - pending গ্রুপ দেখুন
┗━ Reply "yes/no" দিয়ে approve করুন

────────────✦────────────
🚩 Made by TOHIDUL
────────────✦────────────`;

            return api.sendMessage(statusMsg, threadID, messageID);
        }
    } catch (error) {
        console.error('Approve command error:', error);
        return api.sendMessage("❌ কিছু একটা ভুল হয়েছে! আবার চেষ্টা করুন।", threadID, messageID);
    }
};
