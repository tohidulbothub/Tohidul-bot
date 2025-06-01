
const axios = require("axios");

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
                
                // Use Remove.bg official API
                const FormData = require('form-data');
                const form = new FormData();
                form.append('image_url', imageUrl);
                form.append('size', 'auto');
                
                const response = await axios.post('https://api.remove.bg/v1.0/removebg', form, {
                    headers: {
                        ...form.getHeaders(),
                        'X-Api-Key': 'YOUR_REMOVE_BG_API_KEY_HERE' // Replace with your actual API key
                    },
                    responseType: 'arraybuffer'
                });
                
                // Convert response to stream for sending
                const fs = require('fs');
                const path = require('path');
                const tempPath = path.join(__dirname, 'cache', `removebg_${Date.now()}.png`);
                fs.writeFileSync(tempPath, response.data);
                
                api.sendMessage({
                    body: "✅ Background removed successfully!",
                    attachment: fs.createReadStream(tempPath)
                }, event.threadID, event.messageID, () => {
                    // Clean up temp file after sending
                    fs.unlinkSync(tempPath);
                });
                
            } else {
                api.sendMessage("❌ Please reply to an image to remove its background.", event.threadID, event.messageID);
            }
        } catch (error) {
            console.error("RemoveBG Error:", error);
            api.sendMessage("❌ An error occurred while processing the image. Please try again with a different image.", event.threadID, event.messageID);
        }
    }
};
