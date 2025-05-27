const fs = require('fs');
const path = require('path');
const logger = require("../../utils/log.js");

module.exports = {
  config: {
    name: "approveGroup",
    eventType: ["message"]
  },
  run: async function({ api, event, threadsData }) {
    const threadID = event.threadID;
    const configPath = path.join(__dirname, 'config.json');
    const config = require(configPath);

    // Check if already approved
    if (!config.APPROVAL.approvedGroups.includes(threadID)) {
      config.APPROVAL.approvedGroups.push(threadID);
      fs.writeFileSync(
        configPath,
        JSON.stringify(config, null, 2)
      );

      // Stylish message with box, emoji, unicode font, and signature
      const msg = 
`╔════════════════════════╗
✅ 𝙂𝙍𝙊𝙐𝙋 𝘼𝙋𝙋𝙍𝙊𝙑𝙀𝘿!
╚════════════════════════╝

🎉 এই গ্রুপ এখন সফলভাবে অনুমোদিত হয়েছে!
🤖 বট এখানে এখন একটিভ থাকবে।

┏━━━━━━━━━━━━━━━━━━━┓
┃  Enjoy & Stay Active!
┗━━━━━━━━━━━━━━━━━━━┛

🚩 𝙈𝙖𝙙𝙚 𝙗𝙮 𝙏𝙊𝙃𝙄𝘿𝙐𝙇`;

      api.sendMessage(msg, threadID);
    }
  }
};