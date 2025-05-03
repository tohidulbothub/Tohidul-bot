const { gpt } = require("gpti");

module.exports.config = {
  name: "ai",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "Yan Maglinte",
  description: "An AI command using Hercai API!",
  usePrefix: false,
  commandCategory: "chatbots",
  usages: "Ai [prompt]",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
  const prompt = args.join(" ");

  try {
    if (!prompt) {
      api.sendMessage(
        "Please specify a message!",
        event.threadID,
        event.messageID,
      );
      api.setMessageReaction("❓", event.messageID, () => {}, true);
    } else {
      let data = await gpt.v3({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        markdown: false,
        stream: false,
      });

      api.setMessageReaction("⏱️", event.messageID, () => {}, true);
      api.sendMessage(
        data.message,
        event.threadID,
        (err) => {
          if (!err) api.setMessageReaction("", event.messageID, () => {}, true);
        },
        event.messageID,
      );
    }
  } catch (error) {
    api.sendMessage(
      "⚠️ Something went wrong: " + error,
      event.threadID,
      event.messageID,
    );
    api.setMessageReaction("⚠️", event.messageID, () => {}, true);
  }
};
