const axios = require('axios');
const tinyurl = require('tinyurl');
const baseApiUrl = async () => {
  const base = await axios.get(
    `https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json`,
  );
  return base.data.api;
};

module.exports = {
  config: {
    name: "upscaleai",
    aliases: ["4k", "upscale"],
    version: "1.0",
    credits: "tohidul",
    permission: 0,
    description: "🖼️ 𝙄𝙢𝙖𝙜𝙚 𝙐𝙥𝙨𝙘𝙖𝙡𝙚: আপনার ছবি এ.আই দিয়ে ৪কে-তে রূপান্তর করুন!",
    commandCategory: "command",
    prefix: true,
    usePrefix: true
  },

  run: async ({ args, event, api }) => {
    let imageUrl;

    if (event.type === "message_reply") {
      const replyAttachment = event.messageReply.attachments[0];

      if (["photo", "sticker"].includes(replyAttachment?.type)) {
        imageUrl = replyAttachment.url;
      } else {
        return api.sendMessage(
          { body: "❌ 『𝑹𝒆𝒑𝒍𝒚 𝒌𝒐𝒓𝒆 𝒐𝒏𝒍𝒚 𝒊𝒎𝒂𝒈𝒆 𝒅𝒊𝒏!』" },
          event.threadID, event.messageID
        );
      }
    } else if (args[0]?.match(/(https?:\/\/.*\.(?:png|jpg|jpeg))/gi)) {
      imageUrl = args[0];
    } else {
      return api.sendMessage(
        { body: "⚠️ 『𝑹𝒆𝒑𝒍𝒚 𝒌𝒐𝒓𝒆 𝒆𝒌𝒕𝒊 𝒊𝒎𝒂𝒈𝒆 𝒃𝒂 𝒊𝒎𝒂𝒈𝒆 𝑳𝒊𝒏𝒌 𝒅𝒊𝒏!』" },
        event.threadID, event.messageID
      );
    }

    try {
      const url = await tinyurl.shorten(imageUrl);
      api.sendMessage("⏳ 『𝑷𝒍𝒆𝒂𝒔𝒆 𝒘𝒂𝒊𝒕... 𝑨𝑰 𝒖𝒑𝒔𝒄𝒂𝒍𝒊𝒏𝒈』", event.threadID, event.messageID);

      const k = await axios.get(`${await baseApiUrl()}/4k?imageUrl=${url}`);
      const resultUrl = k.data.dipto;

      api.sendMessage(
        {
          body: "✅ 『𝑰𝒎𝒂𝒈𝒆 𝑨𝑰 𝒖𝒑𝒔𝒄𝒂𝒍𝒆 𝒄𝒐𝒎𝒑𝒍𝒆𝒕𝒆𝒅!』\n\n🛠️ 𝑴𝒂𝒅𝒆 𝒃𝒚 𝒕𝒐𝒉𝒊𝒅𝒖𝒍",
          attachment: (await axios.get(resultUrl, { responseType: 'stream' })).data
        },
        event.threadID, event.messageID
      );
    } catch (error) {
      api.sendMessage(
        "❌ 『𝑬𝒓𝒓𝒐𝒓: " + error.message + "』\n\n🛠️ 𝑴𝒂𝒅𝒆 𝒃𝒚 𝒕𝒐𝒉𝒊𝒅𝒖𝒍",
        event.threadID, event.messageID
      );
    }
  }
};
