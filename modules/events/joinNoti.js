const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "joinNoti",
    eventType: ["log:subscribe"],
    version: "1.1.0",
    credits: "TOHIDUL (original: CYBER BOT TEAM)",
    description: "Notification of bots or people entering groups with random gif/photo/video",
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

module.exports.run = async function({ api, event }) {
    const { threadID } = event;
    // If bot is added
    if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
        // Set nickname for bot
        const botname = global.config.BOTNAME || "TOHI-BOT";
        await api.changeNickname(`[ ${global.config.PREFIX} ] • ${botname}`, threadID, api.getCurrentUserID());
        // Send stylish welcome message with video (if exists)
        const videoPath = path.join(__dirname, "cache", "ullash.mp4");
        const msg = 
`╭•┄┅═══❁🌺❁═══┅┄•╮
   আসসালামু আলাইকুম-!!🖤💫
╰•┄┅═══❁🌺❁═══┅┄•╯

________________________

𝐓𝐡𝐚𝐧𝐤 𝐲𝐨𝐮 𝐬𝐨 𝐦𝐮𝐜𝐡 𝐟𝐨𝐫 𝐚𝐝𝐝𝐢𝐧𝐠 𝐦𝐞 𝐭𝐨 𝐲𝐨𝐮𝐫 𝐠𝐫𝐨𝐮𝐩-🖤🤗

𝐈 𝐰𝐢𝐥𝐥 𝐚𝐥𝐰𝐚𝐲𝐬 𝐬𝐞𝐫𝐯𝐞 𝐲𝐨𝐮 𝐢𝐧 𝐬𝐡𝐚 𝐀𝐥𝐥𝐚𝐡 🌺❤️

________________________

𝐓𝐨 𝐯𝐢𝐞𝐰 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬:
${global.config.PREFIX}help
${global.config.PREFIX}menu

𝐁𝐎𝐓 𝐍𝐀𝐌𝐄 : ${botname}

⋆✦⋆⎯⎯⎯⎯⎯⎯⎯⎯⎯⋆✦⋆
`;
        if (fs.existsSync(videoPath)) {
            return api.sendMessage({ body: msg, attachment: fs.createReadStream(videoPath) }, threadID);
        } else {
            return api.sendMessage(msg, threadID);
        }
    }

    // For new member(s)
    try {
        const { threadName, participantIDs } = await api.getThreadInfo(threadID);
        const threadData = global.data.threadData.get(parseInt(threadID)) || {};
        const joinMsgTemplate = (typeof threadData.customJoin == "undefined")
            ? `╭•┄┅═══❁🌺❁═══┅┄•╮
   আসসালামু আলাইকুম-!!🖤
╰•┄┅═══❁🌺❁═══┅┄•╯

✨🆆🅴🅻🅻 🅲🅾🅼🅴✨

❥𝐍𝐄𝐖~🇲‌🇪‌🇲‌🇧‌🇪‌🇷‌~
[   {name} ]

༆-✿ আপনাকে আমাদের࿐
{threadName}
🌺✨!!—এর পক্ষ-থেকে-!!✨🌺

❤️🫰ভালোবাসা অবিরাম🫰❤️

༆-✿ আপনি এই গ্রুপের {memberNumber} নং মেম্বার࿐

╭•┄┅═══❁🌺❁═══┅┄•╮
  🌸 TOHI-BOT TEAM 🌸
╰•┄┅═══❁🌺❁═══┅┄•╯`
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
            files = fs.readdirSync(gifDir);
        }
        let attachment;
        if (files.length > 0) {
            const randomFile = files[Math.floor(Math.random() * files.length)];
            attachment = fs.createReadStream(path.join(gifDir, randomFile));
        }

        return api.sendMessage({ body: msg, attachment, mentions }, threadID);
    } catch (e) {
        console.log(e);
    }
};