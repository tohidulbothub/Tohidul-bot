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
          quality: 'lowest'
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
          // Check if file exists and has content
          if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
            api.editMessage("❌ Downloaded file is empty. Please try again.", info.messageID);
            return;
          }

          // Check file size (limit to 25MB)
          const fileSize = fs.statSync(filePath).size;
          if (fileSize > 26214400) {
            api.editMessage("❌ File too large (max 25MB). Try a shorter song.", info.messageID);
            fs.unlinkSync(filePath);
            return;
          }

          api.sendMessage({
            body: `🎵 ${video.title}\n👤 ${video.author.name}\n⏰ ${video.timestamp}\n👁️ ${video.views.toLocaleString()} views`,
            attachment: fs.createReadStream(filePath)
          }, threadID, (err, messageInfo) => {
            if (err) {
              console.error('Send message error:', err);
              api.editMessage("❌ Failed to send audio file. Please try again.", info.messageID);
            } else {
              // Successfully sent, remove processing message
              api.unsendMessage(info.messageID);
            }
            
            // Auto-delete the song file after sending
            setTimeout(() => {
              if (fs.existsSync(filePath)) {
                try {
                  fs.unlinkSync(filePath);
                } catch (deleteError) {
                  console.log('File cleanup error:', deleteError.message);
                }
              }
            }, 2000);
          }, messageID);
        });

        writeStream.on('error', (error) => {
          console.error('Stream error:', error);
          api.editMessage("❌ Error downloading audio. Please try again.", info.messageID);

          // Clean up on error
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
            } catch (deleteError) {
              console.log('File cleanup error:', deleteError.message);
            }
          }
        });

        // Add timeout for download
        setTimeout(() => {
          if (!writeStream.destroyed) {
            writeStream.destroy();
            api.editMessage("❌ Download timeout. Please try again.", info.messageID);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          }
        }, 60000); // 60 second timeout

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