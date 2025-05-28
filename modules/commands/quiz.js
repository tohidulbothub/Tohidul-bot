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
    version: "1.0",
    credits: "Dipto",
    cooldowns: 0,
    hasPermssion: 0,
    commandCategory: "game",
    usePrefix: true,
    prefix: true,
    commandCategory: "game",
    usages: "{p}quiz2 \n{pn}quiz2 bn \n{p}quiz2 en",
  },

  run: async function ({ api, event, args }) {
    const input = args.join('').toLowerCase() || "bn";
    let timeout = 300;
    let category = "bangla";
    if (input === "bn" || input === "bangla") {
      category = "bangla";
    } else if (input === "en" || input === "english") {
      category = "english";
    } 
    try {
      const response = await axios.get(
        `${await baseApiUrl()}/quiz2?category=${category}&q=random`,
      );

      const quizData = response.data.question;
      const { question, correctAnswer, options } = quizData;
      const { a, b, c, d } = options;
      let uid = event.senderID;
      const namePlayerReact = (await api.getUserInfo(uid))[uid].name;
      const quizMsg = {
        body: `\n╭──✦ ${question}\n├‣ 𝗔) ${a}\n├‣ 𝗕) ${b}\n├‣ 𝗖) ${c}\n├‣ 𝗗) ${d}\n╰──────────────────‣\n𝚁𝚎𝚙𝚕𝚢 𝚝𝚘 𝚝𝚑𝚒𝚜 𝚖𝚎𝚜𝚜𝚊𝚐𝚎 𝚠𝚒𝚝𝚑 𝚢𝚘𝚞𝚛 𝚊𝚗𝚜𝚠𝚎𝚛.`,
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
      api.sendMessage(error.message, event.threadID, event.messageID);
    }
  },

  handleReply: async ({ event, api, handleReply, Users }) => {
const { correctAnswer, nameUser, author } = handleReply;
    if (event.senderID !== author)
      return api.sendMessage(
        "Who are you bby🐸🦎",
        event.threadID,
        event.messageID
      );
    const maxAttempts = 2;

    switch (handleReply.type) {
      case "reply": {
        let userReply = event.body.toLowerCase();
        if (handleReply.attempts >= maxAttempts) {
          await api.unsendMessage(handleReply.messageID);
          const incorrectMsg = `🚫 | ${nameUser}, you have reached the maximum number of attempts (2).\nThe correct answer is: ${correctAnswer}`;
          return api.sendMessage(incorrectMsg, event.threadID, event.messageID);
        }
        if (userReply === correctAnswer.toLowerCase()) {
          api.unsendMessage(handleReply.messageID)
          .catch(console.error);
          
          // Variable reward based on attempts and category
          let baseReward = 200;
          let bonusMultiplier = handleReply.attempts === 0 ? 1.5 : 1.2; // Bonus for first try
          let categoryBonus = category === "english" ? 50 : 0; // Bonus for English questions
          
          let rewardCoins = Math.floor(baseReward * bonusMultiplier) + categoryBonus;
          let rewardExp = Math.floor(100 * bonusMultiplier);
          
          let userData = await Users.getData(author);
          await Users.setData(author, {
            money: userData.money + rewardCoins,
            exp: userData.exp + rewardExp,
            data: userData.data,
          });
          
          let attemptBonus = handleReply.attempts === 0 ? " (First Try Bonus!)" : "";
          let correctMsg = `🎉 Congratulations, ${nameUser}! 🌟\n\n🏆 Quiz Champion!\n💰 Money Earned: ${rewardCoins}$${attemptBonus}\n⭐ Experience: +${rewardExp} EXP\n\n🚀 Keep up the great work!`;
          api.sendMessage(correctMsg, event.threadID, event.messageID);
        } else {
          handleReply.attempts += 1;
          // Update the existing handleReply object in the array
          const index = global.client.handleReply.findIndex(item => item.messageID === handleReply.messageID);
          if (index !== -1) {
            global.client.handleReply[index] = handleReply;
          }
          api.sendMessage(
            `❌ | Wrong Answer. You have ${maxAttempts - handleReply.attempts} attempts left.\n✅ | Try Again!`,
            event.threadID,
            event.messageID,
          );
        }
        break;
      }
      default:
        break;
    }
  },
};