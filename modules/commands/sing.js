const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { request } = require("https");
const SimpleYouTubeAPI = require("simple-youtube-api");
const ytdl = require("ytdl-core");

// 4 YouTube API keys for search fallback
const ytApiKeys = [
  "AIzaSyB5A3Lum6u5p2Ki2btkGdzvEqtZ8KNLeXo",
  "AIzaSyAyjwkjc0w61LpOErHY_vFo6Di5LEyfLK0",
  "AIzaSyBY5jfFyaTNtiTSBNCvmyJKpMIGlpCSB4w",
  "AIzaSyCYCg9qpFmJJsEcr61ZLV5KsmgT1RE5aI4"
];

module.exports.config = {
  name: "sing",
  version: "1.0.0",
  usePrefix: true,
  permssion: 0,
  credits: "Lê Đình, edit: tohi-bot-hub",
  description: "Phát video thông qua link YouTube hoặc tìm kiếm từ khoá",
  commandCategory: "media",
  usages: "[search/song/link]",
  cooldowns: 10,
  dependencies: {
    "ytdl-core": "",
    "simple-youtube-api": ""
  }
};

// Handle reply for user selection
module.exports.handleReply = async function({ api, event, handleReply }) {
  const { threadID, messageID, body: userBody } = event;
  const axios = require("axios");
  const fs = require("fs-extra");

  // Fetch video keys from remote
  const keyRes = await axios.get("https://raw.githubusercontent.com/ledingg1997/ledingg-/main/video.json");
  const apiKey = keyRes.data.keyVideo[Math.floor(Math.random() * keyRes.data.keyVideo.length)].API_KEY;

  let choice = parseInt(userBody);
  if (isNaN(choice) || choice < 1 || choice > 12) {
    return api.sendMessage("সংখ্যা ভুল! দয়া করে 1 থেকে 12 এর মধ্যে দিন।", threadID, messageID);
  }

  // Unsend menu message
  api.unsendMessage(handleReply.messageID);

  try {
    const videoId = handleReply.link[choice - 1];
    // Get download link
    const reqOpts = {
      method: "GET",
      url: "https://ytstream-download-youtube-videos.p.rapidapi.com/dl",
      params: { id: videoId },
      headers: {
        "x-rapidapi-host": "ytstream-download-youtube-videos.p.rapidapi.com",
        "x-rapidapi-key": apiKey
      }
    };
    const res = await axios.request(reqOpts);
    if (res.data.status == "fail") {
      return api.sendMessage("ফাইল পাঠানো যাচ্ছে না।", threadID);
    }

    const title = res.data.title || "YouTube Audio";
    const linkKeys = Object.keys(res.data.link);
    const downloadUrl = res.data.link[linkKeys[1]][0];
    const outPath = path.join(__dirname, "cache", "1.mp3");

    // Download audio file
    const audioData = (await axios.get(downloadUrl, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(outPath, Buffer.from(audioData, "utf-8"));

    // File size check (25MB limit)
    if (fs.statSync(outPath).size > 26 * 1024 * 1024) {
      fs.unlinkSync(outPath);
      return api.sendMessage("Unable to send files because the capacity is greater than 25MB.", threadID, messageID);
    }

    return api.sendMessage(
      { body: `✅ ${title}`, attachment: fs.createReadStream(outPath) },
      threadID,
      () => fs.unlinkSync(outPath),
      messageID
    );
  } catch (err) {
    return api.sendMessage("ফাইল পাঠানো যাচ্ছে না!", threadID, messageID);
  }
};

// Main run function
module.exports.run = async function({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  // API keys for YouTube search and RapidAPI
  const ytApiKey = ytApiKeys[Math.floor(Math.random() * ytApiKeys.length)];
  const youtube = new SimpleYouTubeAPI(ytApiKey);

  // Fetch video keys from remote (for RapidAPI)
  const keyRes = await axios.get("https://raw.githubusercontent.com/ledingg1997/ledingg-/main/video.json");
  const apiKey = keyRes.data.keyVideo[Math.floor(Math.random() * keyRes.data.keyVideo.length)].API_KEY;

  if (!args.length) {
    return api.sendMessage("» উফফ আবাল কি গান শুনতে চাস তার ২/১ লাইন তো লেখবি নাকি 🥵", threadID, messageID);
  }

  const query = args.join(" ");
  // If it's a YouTube link
  if (query.startsWith("https://")) {
    // extract ID
    const ytId = query.split(/^.*(youtu.be\/|v\/|embed\/|watch\?|youtube.com\/user\/[^#]*#([^\/]*?\/)*)\??v?=?([^#\&\?]*).*/)[3];
    try {
      const reqOpts = {
        method: "GET",
        url: "https://ytstream-download-youtube-videos.p.rapidapi.com/dl",
        params: { id: ytId },
        headers: {
          "x-rapidapi-host": "ytstream-download-youtube-videos.p.rapidapi.com",
          "x-rapidapi-key": apiKey
        }
      };
      const res = await axios.request(reqOpts);
      if (res.data.status == "fail") {
        return api.sendMessage("ফাইল পাঠানো যাচ্ছে না।", threadID);
      }
      const title = res.data.title || "YouTube Audio";
      const linkKeys = Object.keys(res.data.link);
      const downloadUrl = res.data.link[linkKeys[1]][0];
      const outPath = path.join(__dirname, "cache", "1.mp3");

      // Download audio file
      const audioData = (await axios.get(downloadUrl, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(outPath, Buffer.from(audioData, "utf-8"));

      // File size check (25MB limit)
      if (fs.statSync(outPath).size > 26 * 1024 * 1024) {
        fs.unlinkSync(outPath);
        return api.sendMessage("Unable to send files because the capacity is greater than 25MB.", threadID, messageID);
      }

      return api.sendMessage(
        { body: `✅ ${title}`, attachment: fs.createReadStream(outPath) },
        threadID,
        () => fs.unlinkSync(outPath),
        messageID
      );
    } catch (err) {
      return api.sendMessage("ফাইল পাঠানো যাচ্ছে না!", threadID, messageID);
    }
  }

  // Search by keyword
  try {
    const results = await youtube.searchVideos(query, 12);
    let links = [];
    let attachments = [];
    let bodyList = "";
    let i = 0;

    for (const video of results) {
      if (!video.id) continue;
      links.push(video.id);

      // Download thumbnail
      const thumbUrl = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
      const thumbPath = path.join(__dirname, "cache", `${i + 1}.png`);
      const thumbData = (await axios.get(thumbUrl, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(thumbPath, Buffer.from(thumbData, "utf-8"));
      attachments.push(fs.createReadStream(thumbPath));

      // Duration
      const detailRes = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${video.id}&key=${ytApiKey}`);
      const duration = detailRes.data.items[0].contentDetails.duration.replace("PT", "").replace("S", "s").replace("M", "m ").replace("H", "h ");

      bodyList += `✅${i + 1} | ${duration} | ${video.title}\n\n`;
      i++;
    }

    const menu = `»🎬${links.length} টি রেজাল্ট পাওয়া গেছে:\n\n${bodyList}Reply করে 1-12 এর যেকোনো নাম্বার দিন, পছন্দের গান ডাউনলোড করতে।`;
    return api.sendMessage(
      { attachment: attachments, body: menu },
      threadID,
      (err, info) => global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: event.senderID,
        link: links
      }),
      messageID
    );
  } catch (err) {
    return api.sendMessage("একটা সমস্যা হয়েছে, একটু পরে আবার চেষ্টা করুন!\n" + err.message, threadID, messageID);
  }
};
