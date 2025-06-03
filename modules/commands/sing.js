const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const SimpleYouTubeAPI = require("simple-youtube-api");

// YouTube API keys for search
const ytApiKeys = [
  "AIzaSyB5A3Lum6u5p2Ki2btkGdzvEqtZ8KNLeXo",
  "AIzaSyAyjwkjc0w61LpOErHY_vFo6Di5LEyfLK0",
  "AIzaSyBY5jfFyaTNtiTSBNCvmyJKpMIGlpCSB4w",
  "AIzaSyCYCg9qpFmJJsEcr61ZLV5KsmgT1RE5aI4"
];

module.exports.config = {
  name: "sing",
  version: "2.0.0",
  usePrefix: true,
  permssion: 0,
  credits: "TOHI-BOT-HUB",
  description: "YouTube video search and download",
  commandCategory: "media",
  usages: "[song name]",
  cooldowns: 5,
  dependencies: {
    "simple-youtube-api": ""
  }
};

// Handle reply for user selection
module.exports.handleReply = async function({ api, event, handleReply }) {
  const { threadID, messageID, body: userBody } = event;

  let choice = parseInt(userBody);
  if (isNaN(choice) || choice < 1 || choice > 5) {
    return api.sendMessage("❌ Invalid choice! Please reply with 1-5", threadID, messageID);
  }

  // Unsend menu message
  api.unsendMessage(handleReply.messageID);

  try {
    const videoId = handleReply.links[choice - 1];
    const downloadUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // Get video info
    const ytApiKey = ytApiKeys[Math.floor(Math.random() * ytApiKeys.length)];
    const videoInfo = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${ytApiKey}`);
    const title = videoInfo.data.items[0].snippet.title;

    // Simple download using yt-dlp alternative API
    const dlResponse = await axios.get(`https://api.cobalt.tools/api/json`, {
      method: 'POST',
      data: {
        url: downloadUrl,
        vFormat: "mp3",
        aFormat: "mp3"
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (dlResponse.data.status === "success") {
      const audioUrl = dlResponse.data.url;
      const outPath = path.join(__dirname, "cache", `${Date.now()}.mp3`);

      // Download audio
      const audioData = await axios.get(audioUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(outPath, Buffer.from(audioData.data));

      // Check file size (25MB limit)
      if (fs.statSync(outPath).size > 25 * 1024 * 1024) {
        fs.unlinkSync(outPath);
        return api.sendMessage("❌ File too large (>25MB)", threadID, messageID);
      }

      return api.sendMessage(
        { 
          body: `🎵 ${title}`, 
          attachment: fs.createReadStream(outPath) 
        },
        threadID,
        () => fs.unlinkSync(outPath),
        messageID
      );
    } else {
      throw new Error("Download failed");
    }
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ Download failed! Try another song.", threadID, messageID);
  }
};

// Main run function
module.exports.run = async function({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!args.length) {
    return api.sendMessage("❌ Please provide a song name!", threadID, messageID);
  }

  const query = args.join(" ");
  const ytApiKey = ytApiKeys[Math.floor(Math.random() * ytApiKeys.length)];
  const youtube = new SimpleYouTubeAPI(ytApiKey);

  try {
    // Search for 5 videos only
    const results = await youtube.searchVideos(query, 5);
    let links = [];
    let bodyList = "";

    for (let i = 0; i < results.length; i++) {
      const video = results[i];
      if (!video.id) continue;

      links.push(video.id);

      // Get duration
      try {
        const detailRes = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${video.id}&key=${ytApiKey}`);
        const duration = detailRes.data.items[0].contentDetails.duration
          .replace("PT", "")
          .replace("S", "s")
          .replace("M", "m ")
          .replace("H", "h ");

        bodyList += `${i + 1}. ${video.title}\n⏱️ ${duration}\n\n`;
      } catch {
        bodyList += `${i + 1}. ${video.title}\n\n`;
      }
    }

    const menu = `🎵 Found ${links.length} songs:\n\n${bodyList}Reply with 1-5 to download.`;

    return api.sendMessage(
      { body: menu },
      threadID,
      (err, info) => {
        if (!err && info) {
          global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: event.senderID,
            links: links
          });
        }
      },
      messageID
    );
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ Search failed! Try again later.", threadID, messageID);
  }
};