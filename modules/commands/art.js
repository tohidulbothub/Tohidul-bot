const axios = require('axios');

const baseApiUrl = async () => {
    const base = await axios.get(
        `https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json`
    );
    return base.data.api;
};

module.exports.config = {
    name: "art",
    version: "1.7.0",
    permission: 0, // Everyone can use this command
    prefix: true,
    credits: "Tohidul",
    description: "Enhance your photos with artful transformations!",
    category: "media",
    usages: "{pn} reply to an image or provide a URL",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    try {
        const cp = ["bal", "zombie", "anime", "ghost", "watercolor", "sketch", "abstract", "cartoon", "monster"];
        const prompts = args[0] || cp[Math.floor(Math.random() * cp.length)];

        const msg = await api.sendMessage(
            `╭───✨ **Art Transformation** ✨───╮\n` +
            `│  🎨 **Processing your image...**  │\n` +
            `╰────────────────────────╯`,
            event.threadID
        );

        let photoUrl = "";

        if (event.type === "message_reply" && event.messageReply?.attachments?.length > 0) {
            photoUrl = event.messageReply.attachments[0].url;
        } else if (args.length > 0) {
            photoUrl = args.join(' ');
        }

        if (!photoUrl) {
            await api.unsendMessage(msg.messageID);
            return api.sendMessage(
                `╭───🚨 **Invalid Input** 🚨───╮\n` +
                `│  🔰 **Please reply to an image or provide a URL!**  │\n` +
                `╰────────────────────────╯\n` +
                `╭───💡 **Crafted by Tohidul** 💡───╮\n` +
                `╰─────────────────────────╯`,
                event.threadID, event.messageID
            );
        }

        const response = await axios.get(`${await baseApiUrl()}/art2?url=${encodeURIComponent(photoUrl)}&prompt=${encodeURIComponent(prompts)}`);

        if (!response.data || !response.data.imageUrl) {
            await api.unsendMessage(msg.messageID);
            return api.sendMessage(
                `╭───🚨 **Processing Failed** 🚨───╮\n` +
                `│  ⚠ **Failed to return a valid image URL.**  │\n` +
                `│  🔄 **Please try again later!**  │\n` +
                `╰────────────────────────╯\n` +
                `╭───💡 **Crafted by Tohidul** 💡───╮\n` +
                `╰─────────────────────────╯`,
                event.threadID, event.messageID
            );
        }

        const imageUrl = response.data.imageUrl;
        await api.unsendMessage(msg.messageID);

        const imageStream = await axios.get(imageUrl, { responseType: 'stream' });

        await api.sendMessage({
            body: `╭───✨ **Artful Image** ✨───╮\n` +
                  `│  🎨 **Here's your transformed masterpiece!**  │\n` +
                  `│  🖌️ **Style**: ${prompts}  │\n` +
                  `╰────────────────────────╯\n` +
                  `╭───💡 **Crafted by Tohidul** 💡───╮\n` +
                  `╰─────────────────────────╯`,
            attachment: imageStream.data
        }, event.threadID, event.messageID);

    } catch (error) {
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
