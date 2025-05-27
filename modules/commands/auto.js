const axios = require("axios");
const request = require("request");
const fs = require("fs-extra");

module.exports.config = {
    name: "auto",
    version: "0.0.3",
    permission: 0, // Everyone can use this command
    usePrefix: true,
    credits: "TOHI-BOT-HUB",
    description: "Automatically download and send videos from provided links.",
    commandCategory: "Media",
    usages: "Reply with a video URL",
    cooldowns: 5
};

module.exports.start = async function ({ nayan, events, args }) {
    // Placeholder for start function, if needed
};

module.exports.handleEvent = async function ({ api, event }) {
    try {
        const content = event.body ? event.body : '';
        const body = content.toLowerCase();

        if (!body.startsWith("https://")) return;

        api.setMessageReaction("🔍", event.messageID, (err) => {}, true);

        const { alldown } = require("nayan-videos-downloader");
        const data = await alldown(content);

        if (!data.data || !data.data.high) {
            api.setMessageReaction("❌", event.messageID, (err) => {}, true);
            return api.sendMessage(
                `╭───🚨 **Processing Failed** 🚨───╮\n` +
                `│  ⚠ **Failed to fetch video data!**  │\n` +
                `│  🔄 **Please check the URL and try again.**  │\n` +
                `╰────────────────────────╯\n` +
                `╭───💡 **Crafted by Tohidul** 💡───╮\n` +
                `╰─────────────────────────╯`,
                event.threadID, event.messageID
            );
        }

        const { low, high, title } = data.data;
        api.setMessageReaction("✔️", event.messageID, (err) => {}, true);

        const video = (await axios.get(high, {
            responseType: "arraybuffer"
        })).data;

        const path = __dirname + "/cache/auto.mp4";
        fs.writeFileSync(path, Buffer.from(video, "utf-8"));

        await api.sendMessage({
            body: `╭───✨ **Video Downloaded** ✨───╮\n` +
                  `│  🎥 **Title**: ${title}  │\n` +
                  `╰────────────────────────╯\n` +
                  `╭───💡 **Crafted by Tohidul** 💡───╮\n` +
                  `╰─────────────────────────╯`,
            attachment: fs.createReadStream(path)
        }, event.threadID, () => fs.unlinkSync(path), event.messageID);

    } catch (error) {
        api.setMessageReaction("❌", event.messageID, (err) => {}, true);
        await api.sendMessage(
            `╭───🚨 **Error Occurred** 🚨───╮\n` +
            `│  ❌ **Something went wrong!** 😓  │\n` +
            `│  📝 **Error**: ${error.message}  │\n` +
            `│  🔄 **Please try again later!**  │\n` +
            `╰────────────────────────╯\n` +
            `╭───💡 **Crafted by Tohidul** 💡───╮\n` +
            `╰─────────────────────────╯`,
            event.threadID, event.messageID
        );
    }
};
