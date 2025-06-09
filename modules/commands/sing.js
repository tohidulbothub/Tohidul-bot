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

        const fileName = `sing_${Date.now()}.mp3`;
        const filePath = __dirname + `/cache/${fileName}`;
        const writeStream = fs.createWriteStream(filePath);

        stream.pipe(writeStream);

        writeStream.on('finish', () => {
          // Check if file exists and has content
          if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
            api.editMessage("❌ Failed to download audio file.", info.messageID);
            return;
          }

          // Create attachment stream
          const attachment = fs.createReadStream(filePath);
          
          api.sendMessage({
            body: `🎵 ${video.title}\n👤 ${video.author.name}\n⏰ ${video.timestamp}\n👁️ ${video.views.toLocaleString()} views`,
            attachment: attachment
          }, threadID, (err, messageInfo) => {
            // Close the stream
            if (attachment && typeof attachment.destroy === 'function') {
              attachment.destroy();
            }
            
            if (err) {
              console.error('Send message error:', err);
              api.editMessage("❌ Failed to send audio file. Please try again.", info.messageID);
            } else {
              api.unsendMessage(info.messageID);
            }

            // Auto-delete the song file after sending
            setTimeout(() => {
              try {
                if (fs.existsSync(filePath)) {
                  fs.unlinkSync(filePath);
                  console.log(`[SING] Cache file deleted: ${fileName}`);
                }
              } catch (deleteError) {
                console.log(`[SING] Cache cleanup error: ${deleteError.message}`);
              }
            }, 2000); // Reduced timeout for faster cleanup
          }, messageID);
        });

        stream.on('error', (error) => {
          console.error('Download stream error:', error);
          api.editMessage("❌ Error downloading audio. Please try again.", info.messageID);
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
            } catch (deleteError) {
              console.log('File cleanup error:', deleteError.message);
            }
          }
        });

        writeStream.on('error', (error) => {
          console.error('Stream error:', error);
          api.editMessage("❌ Error downloading audio. Please try again.", info.messageID);

          // Clean up on error
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
              console.log(`[SING] Error cleanup: ${fileName} deleted`);
            } catch (cleanupError) {
              console.log(`[SING] Error cleanup failed: ${cleanupError.message}`);
            }
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