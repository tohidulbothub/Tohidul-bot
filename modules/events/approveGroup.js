// This file is no longer needed - replaced by pendingApproval.js
// The new approval system handles everything through /approve command
module.exports = {
  config: {
    name: "approveGroup",
    eventType: ["message"]
  },
  run: async function({ api, event, threadsData }) {
    // Disabled - using new approval system
    return;
  }
};