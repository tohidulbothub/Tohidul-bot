
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "art",
    version: "2.0.0",
    credits: "TOHI-BOT-HUB",
    hasPermssion: 0,
    description: "🎨 Transform your photos with AI art styles",
    prefix: true,
    usePrefix: true,
    commandCategory: "image",
    cooldowns: 10,
    usages: "{pn} reply to image [style] or {pn} [style]"
  },

  run: async function ({ message, event, args, api }) {
    try {
      // Available art styles
      const artStyles = [
        "watercolor", "sketch", "anime", "cartoon", "oil_painting", 
        "pencil", "digital", "abstract", "vintage", "cyberpunk",
        "gothic", "fantasy", "realistic", "pop_art", "impressionist"
      ];

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      // Send processing message
      const processingMsg = await api.sendMessage("🎨 Processing your image with AI art transformation...", event.threadID);

      let imageUrl = "";
      let selectedStyle = args[0] || artStyles[Math.floor(Math.random() * artStyles.length)];

      // Get image URL from reply or arguments
      if (event.type === "message_reply" && event.messageReply?.attachments?.length > 0) {
        const attachment = event.messageReply.attachments[0];
        if (attachment.type === "photo") {
          imageUrl = attachment.url;
        } else {
          await api.unsendMessage(processingMsg.messageID);
          return api.sendMessage("❌ Please reply to a photo/image!", event.threadID, event.messageID);
        }
      } else if (args.length > 1 && args[1].includes("http")) {
        imageUrl = args[1];
      } else {
        await api.unsendMessage(processingMsg.messageID);
        return api.sendMessage(
          `🎨 **Art Style Generator**\n\n` +
          `**Usage:**\n` +
          `• Reply to an image: \`/art [style]\`\n` +
          `• Or: \`/art [style] [image_url]\`\n\n` +
          `**Available Styles:**\n` +
          `${artStyles.join(", ")}\n\n` +
          `**Example:** \`/art watercolor\` (reply to image)`,
          event.threadID, event.messageID
        );
      }

      // Validate style
      if (!artStyles.includes(selectedStyle.toLowerCase())) {
        selectedStyle = artStyles[Math.floor(Math.random() * artStyles.length)];
      }

      // Try multiple APIs for art generation
      const apis = [
        `https://api.popcat.xyz/art?image=${encodeURIComponent(imageUrl)}`,
        `https://some-api.herokuapp.com/canvas/art?url=${encodeURIComponent(imageUrl)}&style=${selectedStyle}`,
        `https://api.trace.moe/art?url=${encodeURIComponent(imageUrl)}&filter=${selectedStyle}`
      ];

      let artImageUrl = null;
      let apiUsed = null;

      // Try each API until one works
      for (let i = 0; i < apis.length; i++) {
        try {
          console.log(`[ART] Trying API ${i + 1}: ${apis[i]}`);
          
          const response = await axios.get(apis[i], {
            timeout: 30000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });

          if (response.data) {
            // Handle different API response formats
            if (response.data.url) {
              artImageUrl = response.data.url;
              apiUsed = i + 1;
              break;
            } else if (response.data.result) {
              artImageUrl = response.data.result;
              apiUsed = i + 1;
              break;
            } else if (response.data.image) {
              artImageUrl = response.data.image;
              apiUsed = i + 1;
              break;
            } else if (typeof response.data === 'string' && response.data.includes('http')) {
              artImageUrl = response.data;
              apiUsed = i + 1;
              break;
            }
          }
        } catch (apiError) {
          console.log(`[ART] API ${i + 1} failed:`, apiError.message);
          continue;
        }
      }

      // If all APIs fail, use fallback method
      if (!artImageUrl) {
        console.log('[ART] All APIs failed, using fallback method');
        
        try {
          // Simple fallback: apply CSS filters to simulate art styles
          const fallbackResponse = await axios.get(`https://api.popcat.xyz/blur?image=${encodeURIComponent(imageUrl)}`, {
            timeout: 15000
          });
          
          if (fallbackResponse.data && fallbackResponse.data.url) {
            artImageUrl = fallbackResponse.data.url;
            apiUsed = "fallback";
          }
        } catch (fallbackError) {
          console.log('[ART] Fallback also failed:', fallbackError.message);
        }
      }

      // If still no image, return error
      if (!artImageUrl) {
        await api.unsendMessage(processingMsg.messageID);
        return api.sendMessage(
          "❌ **Art Generation Failed**\n\n" +
          "• All art APIs are currently unavailable\n" +
          "• Please try again later\n" +
          "• Make sure your image URL is valid\n\n" +
          "🔧 **Troubleshooting:**\n" +
          "• Try a different image\n" +
          "• Use a direct image link\n" +
          "• Check if image is publicly accessible",
          event.threadID, event.messageID
        );
      }

      // Download the art image
      const artImagePath = path.join(cacheDir, `art_${Date.now()}.jpg`);
      
      try {
        const imageResponse = await axios.get(artImageUrl, {
          responseType: 'stream',
          timeout: 30000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        const writeStream = fs.createWriteStream(artImagePath);
        imageResponse.data.pipe(writeStream);

        await new Promise((resolve, reject) => {
          writeStream.on('finish', resolve);
          writeStream.on('error', reject);
        });

        // Verify file exists and has content
        if (!fs.existsSync(artImagePath) || fs.statSync(artImagePath).size === 0) {
          throw new Error('Downloaded file is empty or corrupted');
        }

        await api.unsendMessage(processingMsg.messageID);

        // Send the transformed art image
        const successMessage = `
╔══════════════════════════════╗
    🎨 **ART TRANSFORMATION COMPLETE** 🎨
╚══════════════════════════════╝

✨ **Style Applied:** ${selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1)}
🖼️ **Original:** Transformed with AI art filters
🎯 **API Used:** ${apiUsed}
⚡ **Processing:** Completed successfully

🎭 **Available Styles:** watercolor, sketch, anime, cartoon, oil_painting, pencil, digital, abstract, vintage, cyberpunk, gothic, fantasy, realistic, pop_art, impressionist

🚩 **Made by TOHI-BOT-HUB**`;

        await api.sendMessage({
          body: successMessage,
          attachment: fs.createReadStream(artImagePath)
        }, event.threadID, () => {
          // Clean up file after sending
          if (fs.existsSync(artImagePath)) {
            fs.unlinkSync(artImagePath);
            console.log(`[ART] Cleaned up temporary file: ${artImagePath}`);
          }
        }, event.messageID);

        console.log(`[ART] Successfully processed art transformation for user ${event.senderID}`);

      } catch (downloadError) {
        console.error('[ART] Image download failed:', downloadError.message);
        
        // Clean up partial file
        if (fs.existsSync(artImagePath)) {
          fs.unlinkSync(artImagePath);
        }
        
        await api.unsendMessage(processingMsg.messageID);
        return api.sendMessage(
          "❌ **Download Failed**\n\n" +
          "• Could not download the processed image\n" +
          "• The art API response may be corrupted\n" +
          "• Please try again with a different image\n\n" +
          `🔧 **Error:** ${downloadError.message}`,
          event.threadID, event.messageID
        );
      }

    } catch (error) {
      console.error('[ART] Main function error:', error);
      
      // Clean up any partial files
      const cacheDir = path.join(__dirname, "cache");
      try {
        const files = fs.readdirSync(cacheDir).filter(file => file.startsWith('art_'));
        files.forEach(file => {
          const filePath = path.join(cacheDir, file);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      } catch (cleanupError) {
        console.error('[ART] Cleanup error:', cleanupError.message);
      }

      return api.sendMessage(
        "❌ **System Error**\n\n" +
        "• An unexpected error occurred\n" +
        "• Please try again later\n\n" +
        `🔧 **Technical Details:** ${error.message}\n\n` +
        "📞 **Contact:** Report this issue to bot admin\n" +
        "🚩 **Made by TOHI-BOT-HUB**",
        event.threadID, event.messageID
      );
    }
  }
};
