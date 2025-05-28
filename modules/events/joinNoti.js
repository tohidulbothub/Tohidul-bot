
const fs = require("fs-extra");
const path = require("path");
const { apiCallWithRetry } = require("../../utils/apiHelper");

module.exports.config = {
    name: "joinNoti",
    eventType: ["log:subscribe"],
    version: "1.2.0",
    credits: "TOHIDUL (Enhanced by TOHI-BOT-HUB)",
    description: "Enhanced notification system for bot and user joins with random media support",
    dependencies: {
        "fs-extra": "",
        "path": ""
    }
};

module.exports.onLoad = function () {
    const joinvideoDir = path.join(__dirname, "cache", "joinvideo");
    const randomGifDir = path.join(joinvideoDir, "randomgif");
    if (!fs.existsSync(joinvideoDir)) fs.mkdirSync(joinvideoDir, { recursive: true });
    if (!fs.existsSync(randomGifDir)) fs.mkdirSync(randomGifDir, { recursive: true });
};

module.exports.run = async function({ api, event, Users }) {
    try {
        const { threadID } = event;
        
        // If bot is added
        if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
            try {
                // Set nickname for bot
                const botname = global.config.BOTNAME || "TOHI-BOT";
                await api.changeNickname(`[ ${global.config.PREFIX} ] • ${botname}`, threadID, api.getCurrentUserID());
                
                // Get thread info
                const threadInfo = await api.getThreadInfo(threadID);
                const threadName = threadInfo.threadName || "Unknown Group";
                const memberCount = threadInfo.participantIDs.length;
                
                // Enhanced welcome message for bot
                const currentTime = new Date().toLocaleString("bn-BD", {
                    timeZone: "Asia/Dhaka",
                    hour12: false
                });
                
                const msg = `
╔════════════════════════════╗
  🤖 𝗕𝗢𝗧 𝗔𝗖𝗧𝗜𝗩𝗔𝗧𝗘𝗗 🤖
╚════════════════════════════╝

আসসালামু আলাইকুম সবাই! 🌟

🎉 আমি ${botname} এই গ্রুপে যুক্ত হয়েছি!

📊 গ্রুপ তথ্য:
┣━ গ্রুপ: ${threadName}
┣━ সদস্য সংখ্যা: ${memberCount} জন
┣━ আমার প্রিফিক্স: ${global.config.PREFIX}
┗━ মোট কমান্ড: ${global.client.commands.size}+

🚀 শুরু করতে:
┣━ ${global.config.PREFIX}help - সব কমান্ড দেখুন
┣━ ${global.config.PREFIX}menu - ক্যাটাগরি ভিত্তিক মেনু
┗━ ${global.config.PREFIX}info - বট সম্পর্কে জানুন

⭐ বিশেষ সুবিধা:
┣━ AI চ্যাট ও ইমেজ জেনারেশন
┣━ সোশ্যাল মিডিয়া ডাউনলোডার
┣━ গ্রুপ ম্যানেজমেন্ট টুলস
┗━ গেমস ও এন্টারটেইনমেন্ট

🕒 যুক্ত হওয়ার সময়: ${currentTime}

⋆✦⋆⎯⎯⎯⎯⎯⎯⎯⎯⎯⋆✦⋆
🚩 Made by TOHIDUL
⋆✦⋆⎯⎯⎯⎯⎯⎯⎯⎯⎯⋆✦⋆`;

                // Try to send with video attachment
                const videoPath = path.join(__dirname, "cache", "ullash.mp4");
                if (fs.existsSync(videoPath)) {
                    return api.sendMessage({ 
                        body: msg, 
                        attachment: fs.createReadStream(videoPath) 
                    }, threadID);
                } else {
                    return api.sendMessage(msg, threadID);
                }
            } catch (botJoinError) {
                console.error('Bot join notification error:', botJoinError);
                
                // Fallback simple message
                const fallbackMsg = `🤖 ${global.config.BOTNAME || "TOHI-BOT"} সফলভাবে গ্রুপে যুক্ত হয়েছে!\n\n${global.config.PREFIX}help লিখে কমান্ড দেখুন।\n\n🚩 Made by TOHIDUL`;
                return api.sendMessage(fallbackMsg, threadID);
            }
        }

        // For new member(s)
        try {
            const { threadName, participantIDs } = await api.getThreadInfo(threadID);
            const threadData = global.data.threadData.get(parseInt(threadID)) || {};
            
            // Enhanced default join message template
            const joinMsgTemplate = (typeof threadData.customJoin == "undefined")
                ? `
╔════════════════════════════╗
  🎊 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗡𝗘𝗪 𝗠𝗘𝗠𝗕𝗘𝗥 🎊
╚════════════════════════════╝

আসসালামু আলাইকুম! 🌟

🎉 স্বাগতম {name}!

🏠 আপনি এখন "{threadName}" গ্রুপের সদস্য!

📊 গ্রুপ তথ্য:
┣━ আপনি {memberNumber} নং সদস্য
┣━ গ্রুপে বট সুবিধা আছে
┣━ প্রিফিক্স: ${global.config.PREFIX}
┗━ ${global.config.PREFIX}help দিয়ে কমান্ড দেখুন

🎯 গ্রুপ নিয়মাবলী মেনে চলুন
💬 সবার সাথে ভালো ব্যবহার করুন
🤝 একসাথে মজা করুন!

আপনাকে আবারও স্বাগতম! ❤️

────────────✦────────────
🚩 TOHI-BOT TEAM
────────────✦────────────`
                : threadData.customJoin;

            const memJoin = event.logMessageData.addedParticipants;
            let nameArray = [], mentions = [];
            let memberNumberArray = [];

            for (let i = 0; i < memJoin.length; i++) {
                const user = memJoin[i];
                nameArray.push(user.fullName);
                mentions.push({ tag: user.fullName, id: user.userFbId });
                memberNumberArray.push(participantIDs.length - i);
            }

            // Replace variables in template
            let msg = joinMsgTemplate
                .replace(/\{name}/g, nameArray.join(", "))
                .replace(/\{memberNumber}/g, memberNumberArray.join(", "))
                .replace(/\{threadName}/g, threadName);

            // Select random gif/video/image if exists
            const gifDir = path.join(__dirname, "cache", "joinvideo", "randomgif");
            let files = [];
            if (fs.existsSync(gifDir)) {
                files = fs.readdirSync(gifDir).filter(file => {
                    const ext = path.extname(file).toLowerCase();
                    return ['.gif', '.mp4', '.jpg', '.jpeg', '.png'].includes(ext);
                });
            }
            
            let attachment;
            if (files.length > 0) {
                const randomFile = files[Math.floor(Math.random() * files.length)];
                const filePath = path.join(gifDir, randomFile);
                if (fs.existsSync(filePath)) {
                    attachment = fs.createReadStream(filePath);
                }
            }

            return api.sendMessage({ body: msg, attachment, mentions }, threadID);

        } catch (memberJoinError) {
            console.error('Member join notification error:', memberJoinError);
            
            // Fallback notification for new members
            const memJoin = event.logMessageData.addedParticipants;
            const nameArray = memJoin.map(user => user.fullName);
            
            const fallbackMsg = `🎉 স্বাগতম ${nameArray.join(', ')}!\n\nআমাদের গ্রুপে যোগ দেওয়ার জন্য ধন্যবাদ। ${global.config.PREFIX}help লিখে বট কমান্ড দেখুন।\n\n🚩 Made by TOHIDUL`;
            
            return api.sendMessage(fallbackMsg, threadID);
        }
    } catch (error) {
        console.error('JoinNoti main error:', error);
    }
};
