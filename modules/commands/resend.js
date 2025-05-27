const main = "100092006324917";

module.exports.config = {
  name: "resend",
  version: "2.0.0",
  permssion: 1,
  credits: "TOHI-BOT-HUB",
  description: "",
  commandCategory: "admin",
  usePrefix: true,
  usages: "resend",
  cooldowns: 0,
  hide: true,
  dependencies: {
    "request": "",
    "fs-extra": "",
    "axios": ""
  }
};

const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

// Message cache for unsend detection
if (!global.resendCache) global.resendCache = new Map();

module.exports.handleEvent = async function({ event, api, Users }) {
  const { messageID, senderID, threadID, body, attachments = [], type } = event;

  // Get thread data
  if (!global.data) global.data = {};
  if (!global.data.botID) global.data.botID = api.getCurrentUserID();
  if (!global.data.threadData) global.data.threadData = new Map();

  // Per-thread resend setting
  const threadData = global.data.threadData.get(parseInt(threadID)) || {};

  // If resend is off for this thread, skip
  if (typeof threadData.resend === "boolean" && threadData.resend === false) return;

  // Don't cache bot's own messages
  if (senderID == global.data.botID) return;

  // Store message info for later
  if (type === "message") {
    global.resendCache.set(messageID, {
      msgBody: body,
      attachment: attachments
    });
  }

  // On unsend
  if (type === "message_unsend") {
    const cached = global.resendCache.get(messageID);
    if (!cached) return;

    const senderName = await Users.getNameUser(senderID);
    // If no attachment, just send text
    if (!cached.attachment || cached.attachment.length === 0) {
      api.sendMessage(
        `${senderName} unsent the message!\n\nContent:\n${cached.msgBody || ""}`,
        main
      );
    } else {
      // Re-send all attachments
      let files = [];
      let i = 0;
      for (const att of cached.attachment) {
        i++;
        // Download attachment
        let fileExt = (att.type === "photo") ? "jpg" :
                      (att.type === "video") ? "mp4" :
                      (att.type === "audio") ? "mp3" :
                      (att.type === "file") ? "bin" : "dat";
        let attPath = path.join(__dirname, `/cache/resend_${i}.${fileExt}`);

        // Download file
        const response = await axios.get(att.url, { responseType: "arraybuffer" });
        fs.writeFileSync(attPath, Buffer.from(response.data, "utf-8"));
        files.push(fs.createReadStream(attPath));
      }
      api.sendMessage(
        {
          body: `${senderName} unsent the message!\n\nContent:\n${cached.msgBody || ""}\n\nAttachment(s) below.`,
          attachment: files
        },
        main,
        () => {
          // Clean up downloaded files
          for (const file of files) {
            file.close && file.close();
            fs.unlinkSync(file.path);
          }
        }
      );
    }
  }
};

module.exports.run = async function({ api, event, Threads }) {
  const { threadID, messageID } = event;
  const threadData = (await Threads.getData(threadID)).data;
  // Toggle
  threadData.resend = !threadData.resend;
  await Threads.setData(parseInt(threadID), { data: threadData });
  global.data.threadData.set(parseInt(threadID), threadData);
  api.sendMessage(
    `Resend is now ${threadData.resend ? "ON" : "OFF"} for this thread!\nUse again to toggle.`,
    threadID,
    messageID
  );
};
