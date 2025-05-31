
module.exports.config = {
  name: "video2",
  version: "1.0.1",
  permission: 0,
  usePrefix: true,
  credits: "TOHI-BOT-HUB",
  description: "Random video collection",
  commandCategory: "media",
  usages: "video2 [number]",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.run = async function({ event, api, args }) {
  const fs = require("fs-extra");
  const axios = require("axios");
  
  if (!args[0]) {
    return api.sendMessage(
      "====「 𝐕𝐈𝐃𝐄𝐎 」====\n" +
      "━━━━━━━━━━━━━\n" +
      "𝟙. 𝐋𝐎𝐕𝐄 𝐕𝐈𝐃𝐄𝐎 💞\n" +
      "𝟚. 𝐂𝐎𝐔𝐏𝐋𝐄 𝐕𝐈𝐃𝐄𝐎 💕\n" +
      "𝟛. 𝐒𝐇𝐎𝐑𝐓 𝐕𝐈𝐃𝐄𝐎 📽\n" +
      "𝟜. 𝐒𝐀𝐃 𝐕𝐈𝐃𝐄𝐎 😔\n" +
      "𝟝. 𝐒𝐓𝐀𝐓𝐔𝐒 𝐕𝐈𝐃𝐄𝐎 📝\n" +
      "𝟞. 𝐒𝐇𝐀𝐈𝐑𝐈\n" +
      "𝟟. 𝐁𝐀𝐁𝐘 𝐕𝐈𝐃𝐄𝐎 😻\n" +
      "𝟠. 𝐀𝐍𝐈𝐌𝐄 𝐕𝐈𝐃𝐄𝐎\n" +
      "𝟡. 𝐇𝐔𝐌𝐀𝐈𝐘𝐔𝐍 𝐅𝐎𝐑𝐈𝐃 𝐒𝐈𝐑 ❄\n" +
      "𝟙𝟘. 𝐈𝐒𝐋𝐀𝐌𝐈𝐊 𝐕𝐈𝐃𝐄𝐎 🤲\n\n" +
      "===「 𝟏𝟖+ 𝐕𝐈𝐃𝐄𝐎 」===\n" +
      "━━━━━━━━━━━━━\n" +
      "𝟙𝟙. 𝐇𝐎𝐑𝐍𝐘 𝐕𝐈𝐃𝐄𝐎 🥵\n" +
      "𝟙𝟚. 𝐇𝐎𝐓 🔞\n" +
      "𝟙𝟛. 𝐈𝐓𝐄𝐌\n\n" +
      "Reply with a number to get the corresponding video type.",
      event.threadID,
      (err, info) => {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: event.senderID,
          type: "create"
        });
      },
      event.messageID
    );
  }
  
  // Handle direct number input
  const choice = args[0];
  if (choice && choice >= 1 && choice <= 13) {
    try {
      const { videoUrl, caption, count } = await getVideoByChoice(choice);
      
      if (!videoUrl) {
        return api.sendMessage("❌ No video found for this category. Please try another option.", event.threadID, event.messageID);
      }
      
      const videoData = (await axios.get(videoUrl, { responseType: "arraybuffer" })).data;
      const fileName = `video2_${Date.now()}.mp4`;
      const filePath = __dirname + `/cache/${fileName}`;
      
      fs.writeFileSync(filePath, Buffer.from(videoData, "utf-8"));
      
      return api.sendMessage({
        body: `${caption}\n\n¤《𝐓𝐎𝐓𝐀𝐋 𝐕𝐈𝐃𝐄𝐎: ${count}》¤`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
      
    } catch (error) {
      console.error("Video2 error:", error);
      return api.sendMessage("❌ Failed to fetch video. Please try again later.", event.threadID, event.messageID);
    }
  }
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const fs = require("fs-extra");
  const axios = require("axios");
  
  if (handleReply.type === "create") {
    const choice = event.body;
    
    if (!choice || isNaN(choice) || choice < 1 || choice > 13) {
      return api.sendMessage("❌ Invalid choice. Please reply with a number between 1-13.", event.threadID, event.messageID);
    }
    
    try {
      const { videoUrl, caption, count } = await getVideoByChoice(choice);
      
      if (!videoUrl) {
        return api.sendMessage("❌ No video found for this category. Please try another option.", event.threadID, event.messageID);
      }
      
      const videoData = (await axios.get(videoUrl, { responseType: "arraybuffer" })).data;
      const fileName = `video2_${Date.now()}.mp4`;
      const filePath = __dirname + `/cache/${fileName}`;
      
      fs.writeFileSync(filePath, Buffer.from(videoData, "utf-8"));
      
      return api.sendMessage({
        body: `${caption}\n\n¤《𝐓𝐎𝐓𝐀𝐋 𝐕𝐈𝐃𝐄𝐎: ${count}》¤`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
      
    } catch (error) {
      console.error("Video2 handleReply error:", error);
      return api.sendMessage("❌ Failed to fetch video. Please try again later.", event.threadID, event.messageID);
    }
  }
};

async function getVideoByChoice(choice) {
  const axios = require("axios");
  
  try {
    // Get API endpoint from external source
    const apis = await axios.get('https://raw.githubusercontent.com/MOHAMMAD-NAYAN-07/Nayan/main/api.json');
    const baseApi = apis.data.api;
    
    const options = {
      "1": "/video/love",
      "2": "/video/cpl", 
      "3": "/video/shortvideo",
      "4": "/video/sadvideo",
      "5": "/video/status",
      "6": "/video/shairi",
      "7": "/video/baby",
      "8": "/video/anime",
      "9": "/video/humaiyun",
      "10": "/video/islam",
      "11": "/video/horny",
      "12": "/video/hot",
      "13": "/video/item"
    };
    
    const endpoint = `${baseApi}${options[choice]}`;
    const response = await axios.get(endpoint);
    
    return {
      videoUrl: response.data.data,
      caption: response.data.nayan || "Random Video",
      count: response.data.count || "Unknown"
    };
    
  } catch (error) {
    console.error("API fetch error:", error);
    
    // Fallback video URLs (you can add your own fallback videos here)
    const fallbackVideos = {
      "1": "https://example.com/love_video.mp4",
      "2": "https://example.com/couple_video.mp4",
      // Add more fallback URLs as needed
    };
    
    return {
      videoUrl: fallbackVideos[choice] || null,
      caption: "Fallback Video",
      count: "1"
    };
  }
}
