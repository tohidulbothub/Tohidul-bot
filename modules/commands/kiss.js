const request = global.nodemodule["request"];
  const fs = global.nodemodule["fs-extra"];
module.exports.config = {
  name: "kiss",
  version: "1.0.0",
  hasPermssion: 0,
  usePrefix: true,
  credits: "𝙈𝙧𝙏𝙤𝙢𝙓𝙭𝙓",
  description: "Kiss the friend tag",
  commandCategory: "anime",
  usages: "kiss [Tag someone you need Kissing]",
  cooldowns: 5,
};


module.exports.run = async ({ api, event, args }) => {
  const axios = require('axios');
  const request = require('request');
  const fs = require("fs");
  const rateLimitHandler = require("../../utils/rateLimitHandler");
    var out = (msg) => api.sendMessage(msg, event.threadID, event.messageID);
  if (!args.join("")) return out("Please tag someone");
  else
  try {
    const res = await rateLimitHandler.apiCall(() => axios.get('https://api.satou-chan.xyz/api/endpoint/kiss'), 'kiss_api');
    
    if (!res || !res.data || !res.data.url) {
      return api.sendMessage("❌ Kiss API is temporarily unavailable. Please try again later.", event.threadID, event.messageID);
    }
    
    let ext = res.data.url.substring(res.data.url.lastIndexOf(".") + 1);
    var mention = Object.keys(event.mentions)[0];
    let tag = event.mentions[mention].replace("@", "");    

    let callback = function () {
      api.setMessageReaction("✅", event.messageID, (err) => {}, true);
      api.sendMessage({
        body: tag + ", I love you so much ummmmmaaaaaahhhhh ❤️",
        mentions: [{
          tag: tag,
          id: Object.keys(event.mentions)[0]
        }],
        attachment: fs.createReadStream(__dirname + `/cache/kiss.${ext}`)
      }, event.threadID, () => {
        try {
          fs.unlinkSync(__dirname + `/cache/kiss.${ext}`);
        } catch (e) {
          console.log("Error cleaning up kiss file:", e.message);
        }
      }, event.messageID)
    };

    request(res.data.url).pipe(fs.createWriteStream(__dirname + `/cache/kiss.${ext}`)).on("close", callback);
  } catch (err) {
    console.log("Kiss command error:", err.message);
    api.sendMessage("❌ Failed to generate gif, be sure that you've tag someone!", event.threadID, event.messageID);
    api.setMessageReaction("☹️", event.messageID, (err) => {}, true);
  }     
}
