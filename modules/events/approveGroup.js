
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "approveGroup",
    eventType: ["message"]
  },
  run: async function({ api, event, threadsData }) {
    const threadID = event.threadID;
    const config = require('./config.json');
    
    if (!config.APPROVAL.approvedGroups.includes(threadID)) {
      config.APPROVAL.approvedGroups.push(threadID);
      fs.writeFileSync(
        path.join(__dirname, 'config.json'),
        JSON.stringify(config, null, 2)
      );
      
      api.sendMessage(
        `✅ [GROUP APPROVED]\n\nThis group has been approved. The bot is now active.`,
        threadID
      );
    }
  }
};
