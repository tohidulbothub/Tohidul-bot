const axios = require('axios');
const fs = require('fs');

// File to store user teach counts
const teachCountsFile = 'teachCounts.json';

// Initialize teach counts data
let teachCounts = {};
if (fs.existsSync(teachCountsFile)) {
    teachCounts = JSON.parse(fs.readFileSync(teachCountsFile, 'utf-8'));
} else {
    fs.writeFileSync(teachCountsFile, JSON.stringify(teachCounts, null, 2));
}

const baseApiUrl = async () => {
    const base = await axios.get(`https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json`);
    return base.data.api;
};

module.exports.config = {
  name: "teach",
  version: "6.9.9",
  credits: "dipto",
  cooldowns: 0,
  hasPermssion: 0,
  description: "Teach the bot new messages and replies",
  commandCategory: "teach",
  category: "teach",
  usePrefix: true,
  prefix: true,
  usages: `teach [YourMessage] - [Reply1], [Reply2], [Reply3]... OR\nteach [react] [YourMessage] - [react1], [react2], [react3]...`,
};

// Helper function to get user name using API
const getUserName = async (userID, api) => {
    try {
        const userInfo = await api.getUserInfo([userID]);
        return userInfo[userID]?.name || "unknown";
    } catch (error) {
        console.error(`Error fetching user name for ID ${userID}:`, error.message);
        return "unknown";
    }
};

// Function to update teach count
const updateTeachCount = (userID) => {
    if (!teachCounts[userID]) {
        teachCounts[userID] = 0;
    }
    teachCounts[userID]++;
    fs.writeFileSync(teachCountsFile, JSON.stringify(teachCounts, null, 2));
};

module.exports.run = async function ({ api, event, args }) {
    try {
        const link = `${await baseApiUrl()}/baby`;
        const dipto = args.join(" ").toLowerCase();
        const uid = event.senderID;

        if (args[0] === 'teach' && args[1] !== 'amar' && args[1] !== 'react') {
            const [comd, command] = dipto.split(' - ');
            const final = comd.replace("teach ", "");
            if (command.length < 2) {
                return api.sendMessage('❌ | Invalid format! Use [YourMessage] - [Reply1], [Reply2], [Reply3]...', event.threadID, event.messageID);
            }

            const re = await axios.get(`${link}?teach=${final}&reply=${command}&senderID=${uid}`);
            const name = await getUserName(re.data.teacher, api); // Fetch teacher name dynamically

            // Update teach count for the user
            updateTeachCount(uid);

            return api.sendMessage(`✅ Replies added ${re.data.message}\nTeacher: ${name || "unknown"}\nTeachs: ${re.data.teachs}\nYour Teach Count: ${teachCounts[uid]}`, event.threadID, event.messageID);
        }

        if (args[0] === 'teach' && args[1] === 'amar') {
            const [comd, command] = dipto.split(' - ');
            const final = comd.replace("teach ", "");
            if (command.length < 2) {
                return api.sendMessage('❌ | Invalid format! Use [YourMessage] - [Reply1], [Reply2], [Reply3]...', event.threadID, event.messageID);
            }

            const re = await axios.get(`${link}?teach=${final}&senderID=${uid}&reply=${command}&key=intro`);

            // Update teach count for the user
            updateTeachCount(uid);

            return api.sendMessage(`✅ Replies added ${re.data.message}\nYour Teach Count: ${teachCounts[uid]}`, event.threadID, event.messageID);
        }

        if (args[0] === 'teach' && args[1] === 'react') {
            const [comd, command] = dipto.split(' - ');
            const final = comd.replace("teach react ", "");
            if (command.length < 2) {
                return api.sendMessage('❌ | Invalid format! Use [teach] [YourMessage] - [Reply1], [Reply2], [Reply3]...', event.threadID, event.messageID);
            }

            const re = await axios.get(`${link}?teach=${final}&react=${command}`);

            // Update teach count for the user
            updateTeachCount(uid);

            return api.sendMessage(`✅ Replies added ${re.data.message}\nYour Teach Count: ${teachCounts[uid]}`, event.threadID, event.messageID);
        }

    } catch (e) {
        console.error('Error in command execution:', e);
        return api.sendMessage(`Error: ${e.message}`, event.threadID, event.messageID);
    }
};
