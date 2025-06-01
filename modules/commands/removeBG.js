
const axios = require("axios");
const baseApiUrl = async () => {
    const base = await axios.get(
        `https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json`
    );
    return base.data.api;
};

module.exports = {
    config: {
        name: "removebg",
        aliases: ["rbg"], 
        version: "1.0", 
        hasPermssion: 0,
        credits: "TOHI-BOT-HUB",
        usePrefix: true,
        description: "Removes background from an image",
        commandCategory: "utility",
        cooldowns: 5,
        usages: "removebg reply with an image"
    },
    
    run: async function({ api, event, args }) {
        try {
            if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments[0]?.url) {
                const imageUrl = event.messageReply.attachments[0].url;
                
                api.sendMessage("🔄 Processing image, please wait...", event.threadID);
                
                const response = await axios.get(`${await baseApiUrl()}/dipto/rmbg?url=${encodeURIComponent(imageUrl)}`, {
                    responseType: 'stream'
                });
                
                api.sendMessage({
                    body: "✅ Background removed successfully!",
                    attachment: response.data
                }, event.threadID, event.messageID);
                
            } else {
                api.sendMessage("❌ Please reply to an image to remove its background.", event.threadID, event.messageID);
            }
        } catch (error) {
            console.error("RemoveBG Error:", error);
            api.sendMessage("❌ An error occurred while processing the image. Please try again with a different image.", event.threadID, event.messageID);
        }
    }
};
