
const axios = require("axios");
const baseApiUrl = async () => {
    const base = await axios.get(
        "https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json"
    );
    return base.data.api;
};

module.exports.config = {
    name: "quiz",
    version: "1.0",
    credits: "TOHI-BOT-HUB",
    cooldowns: 5,
    hasPermission: 0,
    description: "quiz",
    commandCategory: "MEDIA",
    category: "MEDIA",
    usePrefix: true,
    prefix: true,
    usages: "/quiz",
};

module.exports.run = async function ({ api, event }) {
    const { threadID: t, messageID: m } = event;
    try {
        const response = await axios.get(`${await baseApiUrl()}/quiz3?randomQuiz=random`);
        const imageStream = await axios({
            method: "GET",
            url: response.data.link,
            responseType: 'stream'
        });

        api.sendMessage({
            body: "Please reply to this photo with your answer:",
            attachment: imageStream.data
        }, t, (error, info) => {
            if (error) {
                console.error("Error sending quiz:", error);
                return;
            }
            
            global.client.handleReply.push({
                name: this.config.name,
                messageID: info.messageID,
                author: event.senderID,
                correctAnswer: response.data.quiz,
                rewardAmount: 200
            });
            
            setTimeout(async () => {
                try {
                    await api.unsendMessage(info.messageID);
                    // Remove from handleReply array when timeout
                    const index = global.client.handleReply.findIndex(item => item.messageID === info.messageID);
                    if (index !== -1) {
                        global.client.handleReply.splice(index, 1);
                    }
                } catch (err) {
                    console.error("Error unsending message:", err);
                }
            }, 30000);
        }, m);

    } catch (error) {
        console.error(error);
        api.sendMessage(`Error: ${error.message}`, t);
    }
};

module.exports.handleReply = async function ({ api, Users, Currencies, handleReply, event }) {
    const { threadID: t, senderID: s, messageID: m, body } = event;
    const { author, correctAnswer, messageID, rewardAmount } = handleReply;
    
    if (s !== author) return;

    try {
        const userAnswer = body.trim();
        const isCorrect = (userAnswer.toLowerCase() === correctAnswer.toLowerCase());
        const userData = await Users.getData(s);
        const name = userData.name || "Unknown";

        // Remove from handleReply array
        const index = global.client.handleReply.findIndex(item => item.messageID === messageID);
        if (index !== -1) {
            global.client.handleReply.splice(index, 1);
        }

        if (isCorrect) {
            await api.unsendMessage(messageID);
            await Currencies.increaseMoney(s, rewardAmount);
            await api.sendMessage({
                body: `🎉 Correct answer, ${name}! You earned ${rewardAmount}$.`,
                mentions: [{ tag: name, id: s }]
            }, t, m);
        } else {
            await api.unsendMessage(messageID);
            await Currencies.decreaseMoney(s, 5);
            await api.sendMessage({
                body: `❌ Incorrect answer! You lost 5$. The correct answer was: ${correctAnswer}`,
            }, t, m);
        }
    } catch (error) {
        console.error("Quiz handleReply error:", error);
        api.sendMessage(`Error processing answer: ${error.message}`, t);
    }
};
