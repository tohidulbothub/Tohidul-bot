module.exports.config = {
  name: "video",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "TOHI-BOT-HUB",
  description: "Play video from YouTube",
  usePrefix: true,
  commandCategory: "music",
  usages: "video [Text]",
  cooldowns: 10,
  dependencies: {
    "nayan-videos-downloader": "",
    "fs-extra": "",
    "axios": ""
  }
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const fs = require("fs-extra");
  const axios = require("axios");
  const { ytdown } = require("nayan-videos-downloader");

  try {
    const res = await ytdown(handleReply.link[event.body - 1]);
    const videoUrl = res.data.video;
    const title = res.data.title;

    api.sendMessage(`Downloading Video!\n❍━━━━━━━━━━━━❍\n${title}\n❍━━━━━━━━━━━━❍\nThis may take a while!`, event.threadID, (err, info) =>
      setTimeout(() => { api.unsendMessage(info.messageID) }, 100000));

    const videoData = (await axios.get(videoUrl, { responseType: 'arraybuffer' })).data;
    const fileName = `${Date.now()}.mp4`;
    const filePath = __dirname + `/cache/${fileName}`;

    fs.writeFileSync(filePath, Buffer.from(videoData, "utf-8"));

    if (fs.statSync(filePath).size > 26214400) {
      return api.sendMessage('The file could not be sent because it is larger than 25MB.', event.threadID, () => fs.unlinkSync(filePath), event.messageID);
    }

    return api.sendMessage({
      body: `${title}`,
      attachment: fs.createReadStream(filePath)
    }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);

  } catch (error) {
    console.error("Video download error:", error);
    api.sendMessage("There was a problem while processing the request. Please try again later.", event.threadID, event.messageID);
  }

  return api.unsendMessage(handleReply.messageID);
};

module.exports.run = async function({ api, event, args }) {
  const fs = require("fs-extra");
  const axios = require("axios");
  const { ytdown } = require("nayan-videos-downloader");

  if (args.length == 0 || !args) {
    return api.sendMessage('Search cannot be left blank!', event.threadID, event.messageID);
  }

  const keywordSearch = args.join(" ");
  const videoPattern = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/gm;
  const urlValid = videoPattern.test(args[0]);

  if (urlValid) {
    try {
      const res = await ytdown(args[0]);
      const videoUrl = res.data.video;
      const title = res.data.title;

      api.sendMessage(`Downloading: ${title}`, event.threadID, (err, info) =>
        setTimeout(() => { api.unsendMessage(info.messageID) }, 10000));

      const videoData = (await axios.get(videoUrl, { responseType: 'arraybuffer' })).data;
      const fileName = `${Date.now()}.mp4`;
      const filePath = __dirname + `/cache/${fileName}`;

      fs.writeFileSync(filePath, Buffer.from(videoData, "utf-8"));

      if (fs.statSync(filePath).size > 26214400) {
        return api.sendMessage('The file could not be sent because it is larger than 25MB.', event.threadID, () => fs.unlinkSync(filePath), event.messageID);
      }

      return api.sendMessage({
        body: `${title}`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);

    } catch (error) {
      console.error("Direct URL download error:", error);
      api.sendMessage("Your request could not be processed! Please try again later.", event.threadID, event.messageID);
    }
  } else {
    // For search functionality, use a simpler approach without YouTube API
    try {
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(keywordSearch)}`;
      const msg = `🔍 Search Results for: "${keywordSearch}"\n\nPlease copy a YouTube video URL and use the command again with the direct link.\n\nExample: /video https://youtu.be/VIDEO_ID`;

      return api.sendMessage(msg, event.threadID, event.messageID);

    } catch (error) {
      console.error("Search error:", error);
      api.sendMessage("Search functionality is currently unavailable. Please provide a direct YouTube URL.", event.threadID, event.messageID);
    }
  }
};