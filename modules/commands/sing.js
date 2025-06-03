const fs = require("fs");
const axios = require("axios");
const ytdl = require("@distube/ytdl-core");
const yts = require("yt-search");

module.exports.config = {
  name: "sing",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "TOHI-BOT-HUB",
  description: "Sing/Play music from YouTube",
  commandCategory: "music",
  usages: "[search query]",
  cooldowns: 20,
  usePrefix: true
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;

  if (!args.length) {
    return api.sendMessage("⚠️ Please provide a song name or search query.", threadID, messageID);
  }

  const query = args.join(" ");

  try {
    api.sendMessage("🔍 Searching for music...", threadID, async (err, info) => {
      if (err) return;

      try {
        // Search for videos
        const searchResults = await yts(query);

        if (!searchResults.videos.length) {
          api.editMessage("❌ No music found for your search query.", info.messageID);
          return;
        }

        const video = searchResults.videos[0];
        const videoUrl = video.url;

        // Check video duration (limit to 10 minutes)
        if (video.seconds > 600) {
          api.editMessage("❌ Song is too long (max 10 minutes allowed).", info.messageID);
          return;
        }

        api.editMessage(`🎵 Found: ${video.title}\n⏳ Downloading audio...`, info.messageID);

        // Download audio
        const stream = ytdl(videoUrl, {
          filter: 'audioonly',
          quality: 'lowest',
          format: 'mp3'
        });

        // Ensure cache/songs directory exists
        const cacheDir = `${__dirname}/cache/songs`;
        if (!fs.existsSync(cacheDir)) {
          fs.mkdirSync(cacheDir, { recursive: true });
        }

        const fileName = `sing_${Date.now()}.mp3`;
        const filePath = `${cacheDir}/${fileName}`;
        const writeStream = fs.createWriteStream(filePath);

        stream.pipe(writeStream);

        writeStream.on('finish', () => {
          api.sendMessage({
            body: `🎵 ${video.title}\n👤 ${video.author.name}\n⏰ ${video.timestamp}\n👁️ ${video.views.toLocaleString()} views`,
            attachment: fs.createReadStream(filePath)
          }, threadID, () => {
            // Auto-delete the song file after sending
            setTimeout(() => {
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
            }, 1000);
            api.unsendMessage(info.messageID);
          }, messageID);
        });

        writeStream.on('error', (error) => {
          console.error('Stream error:', error);
          api.editMessage("❌ Error downloading audio. Please try again.", info.messageID);

          // Clean up on error
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });

      } catch (error) {
        console.error('Search/Download error:', error);
        api.editMessage("❌ Error processing your request. Please try again.", info.messageID);
      }
    });

  } catch (error) {
    console.error('General error:', error);
    api.sendMessage("❌ An error occurred. Please try again later.", threadID, messageID);
  }
};