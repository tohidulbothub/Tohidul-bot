const fs = require("fs");
const axios = require("axios");

module.exports.config = {
    name: "anicouple",
    version: "1.0.8",
    permission: 0, // Everyone can use this command
    prefix: true,
    credits: "Tohidul",
    description: "Fetches a random anime couple photo with a stylish output.",
    category: "media",
    cooldowns: 2
};

module.exports.run = async function ({ api, event }) {
    try {
        // Fetch random anime couple image from API
        const response = await axios.get("https://api.waifu.pics/sfw/couple");
        const imgUrl = response.data.url;

        // Download the image
        const imgResponse = await axios({
            url: imgUrl,
            responseType: "stream"
        });

        // Save image temporarily
        const path = __dirname + "/cache/anicouple.jpg";
        const writer = fs.createWriteStream(path);
        imgResponse.data.pipe(writer);

        // Wait for the image to be saved
        await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
        });

        // Prepare stylish message
        const msg = `╭───✨ **Anime Couple Photo** ✨───╮\n` +
                    `│  📸 **Random Anime Couple**  │\n` +
                    `╰──────────────────────╯\n\n` +
                    `🌟 **Enjoy this adorable moment!** 🌟\n` +
                    `╭───💡 **Crafted by Tohidul** 💡───╮\n` +
                    `╰─────────────────────────╯`;

        // Send message with image attachment
        api.sendMessage({
            body: msg,
            attachment: fs.createReadStream(path)
        }, event.threadID, () => fs.unlinkSync(path), event.messageID);

    } catch (error) {
        api.sendMessage("❌ **Oops! Something went wrong!** 😓\nFailed to fetch anime couple photo. Please try again later! 🚨", event.threadID, event.messageID);
    }
};
