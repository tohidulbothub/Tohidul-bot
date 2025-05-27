
const { log } = require("../../utils/log.js");

module.exports.config = {
  name: "antichange",
  eventType: ["log:subscribe", "log:thread-name", "log:thread-image"],
  version: "1.0.0",
  credits: "Nayan",
  description: "Prevent unauthorized group changes",
};

module.exports.run = async function({ api, event, Users, Threads }) {
  const { threadID, logMessageType, logMessageData, author } = event;
  
  try {
    const threadData = await Threads.getData(threadID);
    const threadInfo = threadData.threadInfo || {};
    
    // Check if antichange is enabled for this group
    if (!threadInfo.antichange) return;
    
    // Don't trigger for bot actions
    if (author === api.getCurrentUserID()) return;
    
    // Check if user is admin or bot admin
    const isAdmin = threadInfo.adminIDs && threadInfo.adminIDs.some(admin => admin.id === author);
    const isBotAdmin = global.config.ADMINBOT && global.config.ADMINBOT.includes(author);
    
    if (isAdmin || isBotAdmin) return;
    
    const userName = await Users.getNameUser(author);
    
    switch (logMessageType) {
      case "log:thread-name":
        // Revert thread name change
        if (threadInfo.threadName) {
          api.setTitle(threadInfo.threadName, threadID);
        }
        api.sendMessage(`⚠️ ${userName}, you are not allowed to change the group name!`, threadID);
        break;
        
      case "log:thread-image":
        // Notify about image change attempt
        api.sendMessage(`⚠️ ${userName}, you are not allowed to change the group image!`, threadID);
        break;
        
      default:
        break;
    }
  } catch (error) {
    log(error, "ERROR");
  }
};
