
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
  version: "2.1.0",
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

    // Use a working YouTube download API
    const downloadApis = [
      `https://api.cobalt.tools/api/json`,
      `https://youtube-mp3-downloader.p.rapidapi.com/dl`,
      `https://yt-api.p.rapidapi.com/dl`
    ];

    let audioUrl = null;
    let downloadSuccess = false;

    // Try different download APIs
    for (const apiUrl of downloadApis) {
      try {
        let response;
        
        if (apiUrl.includes('cobalt.tools')) {
          // Try new Cobalt API format
          response = await axios.post(apiUrl, {
            url: downloadUrl,
            vFormat: "mp3",
            aFormat: "mp3"
          }, {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 15000
          });
        } else {
          // Try alternative APIs
          response = await axios.get(`${apiUrl}?url=${encodeURIComponent(downloadUrl)}`, {
            timeout: 15000
          });
        }

        if (response.data && (response.data.url || response.data.download_url)) {
          audioUrl = response.data.url || response.data.download_url;
          downloadSuccess = true;
          break;
        }
      } catch (error) {
        console.log(`API ${apiUrl} failed:`, error.message);
        continue;
      }
    }

    if (!downloadSuccess || !audioUrl) {
      // Fallback: provide YouTube link
      return api.sendMessage(
        `❌ Download failed, but here's the YouTube link:\n🎵 ${title}\n🔗 ${downloadUrl}`,
        threadID,
        messageID
      );
    }

    const outPath = path.join(__dirname, "cache", `${Date.now()}.mp3`);

    try {
      // Download audio with timeout and retry
      const audioData = await axios.get(audioUrl, { 
        responseType: "arraybuffer",
        timeout: 30000,
        maxRedirects: 5
      });
      
      fs.writeFileSync(outPath, Buffer.from(audioData.data));

      // Check file size (25MB limit)
      const fileSize = fs.statSync(outPath).size;
      if (fileSize > 25 * 1024 * 1024) {
        fs.unlinkSync(outPath);
        return api.sendMessage("❌ File too large (>25MB)", threadID, messageID);
      }

      if (fileSize < 1000) {
        fs.unlinkSync(outPath);
        return api.sendMessage("❌ Downloaded file is too small or corrupted", threadID, messageID);
      }

      return api.sendMessage(
        { 
          body: `🎵 ${title}`, 
          attachment: fs.createReadStream(outPath) 
        },
        threadID,
        () => {
          try {
            fs.unlinkSync(outPath);
          } catch (e) {
            console.log("Error deleting file:", e.message);
          }
        },
        messageID
      );

    } catch (downloadError) {
      console.error("Download error:", downloadError.message);
      return api.sendMessage(
        `❌ Download failed, but here's the YouTube link:\n🎵 ${title}\n🔗 ${downloadUrl}`,
        threadID,
        messageID
      );
    }

  } catch (err) {
    console.error("Overall error in handleReply:", err.message);
    return api.sendMessage("❌ An error occurred. Please try again later.", threadID, messageID);
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
    
    if (!results || results.length === 0) {
      return api.sendMessage("❌ No results found for your search.", threadID, messageID);
    }

    let links = [];
    let bodyList = "";

    for (let i = 0; i < results.length; i++) {
      const video = results[i];
      if (!video.id) continue;

      links.push(video.id);

      // Get duration
      try {
        const detailRes = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${video.id}&key=${ytApiKey}`, {
          timeout: 10000
        });
        
        if (detailRes.data.items && detailRes.data.items.length > 0) {
          const duration = detailRes.data.items[0].contentDetails.duration
            .replace("PT", "")
            .replace("S", "s")
            .replace("M", "m ")
            .replace("H", "h ");

          bodyList += `${i + 1}. ${video.title}\n⏱️ ${duration}\n\n`;
        } else {
          bodyList += `${i + 1}. ${video.title}\n\n`;
        }
      } catch (durationError) {
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
    console.error("Search error:", err.message);
    return api.sendMessage("❌ Search failed! Try again later.", threadID, messageID);
  }
};
