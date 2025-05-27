
module.exports = {
  config: {
    name: "approveCommand",
    eventType: ["message"]
  },
  run: async function({ api, event }) {
    const { body, senderID } = event;
    const args = body.split(' ');

    if (args[0] === 'approve') {
      const threadID = args[1];
      const config = require('./config.json');
      
      if (config.APPROVAL.pendingGroups.includes(threadID)) {
        config.APPROVAL.pendingGroups = config.APPROVAL.pendingGroups.filter(id => id !== threadID);
        config.APPROVAL.approvedGroups.push(threadID);
        
        api.sendMessage(`✅ Group ${threadID} has been approved successfully.`, senderID);
        api.sendMessage(`✅ [GROUP APPROVED]\n\nThe bot is now active in this group.`, threadID);
      }
    }
  }
};
