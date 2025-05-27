// This file is disabled - using new approval system in pendingApproval.js
module.exports = {
  config: {
    name: "approveCommand", 
    eventType: ["message"]
  },
  run: async function({ api, event }) {
    // Disabled - using new approval system
    return;
  }
};