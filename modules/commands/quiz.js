const axios = require("axios");

const baseApiUrl = async () => {
  const base = await axios.get(
    `https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json`
  );
  return base.data.api;
};

module.exports = {
  config: {
    name: "quiz",
    version: "1.1",
    credits: "Dipto, styled by TOHIDUL",
    cooldowns: 0,
    hasPermssion: 0,
    commandCategory: "game",
    usePrefix: true,
    prefix: true,
    usages: "{p}quiz\n{pn}quiz bn\n{p}quiz en",
  },

  run: async function ({ api, event, args }) {
    const input = args.join('').toLowerCase() || "bn";
    let timeout = 300;
    let category = "bangla";
    if (input === "bn" || input === "bangla") category = "bangla";
    else if (input === "en" || input === "english") category = "english";

    try {
      const response = await axios.get(
        `${await baseApiUrl()}/quiz?category=${category}&q=random`
      );
      const quizData = response.data.question;
      const { question, correctAnswer, options } = quizData;
      const { a, b, c, d } = options;
      const uid = event.senderID;
      const namePlayerReact = (await api.getUserInfo(uid))[uid].name;

      const quizMsg = {
        body:
`╭─❖━━❖[ 𝑸𝑼𝑰𝒁 𝑻𝑰𝑴𝑬 ]❖━━❖─╮
🔮  প্রশ্ন: ${question}

🅐) ${a}
🅑) ${b}
🅒) ${c}
🅓) ${d}
╰────────────────────────╯

📩 উত্তর দিতে এই মেসেজে রিপ্লাই দিন! (A/B/C/D)
⏳ সময়: ${timeout} সেকেন্ড

👤 খেলোয়াড়: ${namePlayerReact}
✨ শুভকামনা!
`,
      };

      api.sendMessage(
        quizMsg,
        event.threadID,
        (error, info) => {
          global.client.handleReply.push({
            type: "reply",
            name: this.config.name,
            author: event.senderID,
            messageID: info.messageID,
            dataGame: quizData,
            correctAnswer,
            nameUser: namePlayerReact,
            attempts: 0
          });
          setTimeout(() => {
            api.unsendMessage(info.messageID);
          }, timeout * 1000);
        },
        event.messageID,
      );
    } catch (error) {
      console.log("❌ | Error occurred:", error);
      api.sendMessage("কুইজ আনতে সমস্যা হচ্ছে! পরে চেষ্টা করুন।", event.threadID, event.messageID);
    }
  },

  handleReply: async ({ event, api, handleReply, Users }) => {
    const { correctAnswer, nameUser, author } = handleReply;
    if (event.senderID !== author)
      return api.sendMessage(
        "⛔ শুধু কুইজ শুরু করা ইউজারই উত্তর দিতে পারবে!", event.threadID, event.messageID
      );

    const maxAttempts = 2;

    switch (handleReply.type) {
      case "reply": {
        let userReply = event.body.trim().toLowerCase();

        // Answer letter normalization
        let normalized = userReply[0];
        if (["a","b","c","d"].includes(normalized)) userReply = normalized;
        // Also allow Bengali equivalents
        else if (["এ", "বি", "সি", "ডি"].includes(userReply[0])) {
          userReply = { "এ": "a", "বি": "b", "সি": "c", "ডি": "d" }[userReply[0]];
        }

        if (handleReply.attempts >= maxAttempts) {
          await api.unsendMessage(handleReply.messageID);
          const incorrectMsg =
`⛔ ${nameUser}, তুমি সর্বোচ্চ চেষ্টা (${maxAttempts}) করে ফেলেছো!
✅ সঠিক উত্তর ছিল: ${correctAnswer.toUpperCase()}

🔁 নতুন কুইজ নিতে ${prefix}quiz লিখো!`;
          return api.sendMessage(incorrectMsg, event.threadID, event.messageID);
        }

        if (userReply === correctAnswer.toLowerCase()) {
          api.unsendMessage(handleReply.messageID).catch(console.error);
          let rewardCoins = 200;
          let rewardExp = 100;
          let userData = await Users.getData(author);
          await Users.setData(author, {
            money: userData.money + rewardCoins,
            exp: userData.exp + rewardExp,
            data: userData.data,
          });
          const threadData = await global.data.threadData.get(event.threadID) || {};
          const prefix = threadData.PREFIX || global.config.PREFIX;
          let correctMsg =
`🎉 অভিনন্দন, ${nameUser}! 🌟
✅ একদম ঠিক উত্তর! তুমি কুইজ চ্যাম্পিয়ন! 🏆

💰 পুরস্কার: ${rewardCoins} কয়েন
⚡ অভিজ্ঞতা: ${rewardExp} XP

নতুন কুইজের জন্য: ${prefix}quiz
`;
          api.sendMessage(correctMsg, event.threadID, event.messageID);
        } else {
          handleReply.attempts += 1;
          api.sendMessage(
`❌ ভুল উত্তর! 
🔁 আরও ${maxAttempts - handleReply.attempts} বার চেষ্টা করতে পারো। 
আবার চেষ্টা করো!`, event.threadID, event.messageID
          );
        }
        break;
      }
      default:
        break;
    }
  },
};