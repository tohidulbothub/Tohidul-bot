
module.exports.config = {
  name: "botLeave", 
  eventType: ["log:unsubscribe"],
  version: "1.0.0",
  credits: "TOHI-BOT-HUB",
  description: "Delete group data when bot is kicked or leaves from group"
};

module.exports.run = async function({ api, event, Threads }) {
  try {
    const { threadID } = event;
    const { leftParticipantFbId } = event.logMessageData;
    
    // Check if the bot itself left/was kicked
    if (leftParticipantFbId == api.getCurrentUserID()) {
      console.log(`Bot left from group: ${threadID}, deleting group data...`);
      
      try {
        // Delete group data from database
        await Threads.delData(threadID);
        
        // Remove from global data arrays
        const allThreadIDIndex = global.data.allThreadID.indexOf(threadID);
        if (allThreadIDIndex !== -1) {
          global.data.allThreadID.splice(allThreadIDIndex, 1);
        }
        
        // Remove thread info from global data
        if (global.data.threadInfo.has(threadID)) {
          global.data.threadInfo.delete(threadID);
        }
        
        if (global.data.threadData.has(threadID)) {
          global.data.threadData.delete(threadID);
        }
        
        // Remove from banned lists if exists
        if (global.data.threadBanned.has(threadID)) {
          global.data.threadBanned.delete(threadID);
        }
        
        // Remove from NSFW allowed list if exists
        const nsfwIndex = global.data.threadAllowNSFW.indexOf(threadID);
        if (nsfwIndex !== -1) {
          global.data.threadAllowNSFW.splice(nsfwIndex, 1);
        }
        
        global.loading.log(`⫸ TBH ➤ [ DELETE DATA ] Perform group data deletion ${threadID}`, "DATABASE");
        console.log(`✅ Successfully deleted all data for group: ${threadID}`);
        
      } catch (error) {
        console.error(`❌ Error deleting group data for ${threadID}:`, error);
        global.loading.err(`Failed to delete group data for ${threadID}: ${error.message}`, "DATABASE");
      }
    }
    
  } catch (error) {
    console.error("Error in botLeave event:", error);
  }
};
