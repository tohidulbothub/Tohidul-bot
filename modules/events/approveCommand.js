const fs = require("fs");
const logger = require("../../utils/log.js");

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
      const configPath = __dirname + '/config.json';
      const config = require(configPath);

      if (config.APPROVAL.pendingGroups.includes(threadID)) {
        // Remove from pending, add to approved
        config.APPROVAL.pendingGroups = config.APPROVAL.pendingGroups.filter(id => id !== threadID);
        config.APPROVAL.approvedGroups.push(threadID);

        // Save to file
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        // Fancy message to sender (admin)
        api.sendMessage(
`╔════════════════════════╗
✅ 𝙂𝙧𝙤𝙪𝙥 𝘼𝙥𝙥𝙧𝙤𝙫𝙚𝙙!
╚════════════════════════╝

• Group ID: ${threadID}
• Approved by: ${senderID}

🚩 𝙏𝙤𝙝𝙞𝙙𝙪𝙡 𝘽𝙤𝙩 𝘼𝙙𝙢𝙞𝙣`, 
          senderID);

        // Fancy message to group
        api.sendMessage(
`╔════════════════════════╗
🤖 𝘽𝙤𝙩 𝘼𝙘𝙩𝙞𝙫𝙖𝙩𝙚𝙙!
╚════════════════════════╝

🎉 এই গ্রুপ এখন সফলভাবে অনুমোদিত হয়েছে!
বট এখন এখানে সম্পূর্ণভাবে কাজ করবে।

┏━━━━━━━━━━━━━━━━━━━┓
┃  Enjoy & Stay Active!
┗━━━━━━━━━━━━━━━━━━━┛

🚩 𝙈𝙖𝙙𝙚 𝙗𝙮 𝙏𝙊𝙃𝙄𝘿𝙐𝙇`, 
          threadID);

        logger(`Group approved: ${threadID} by ${senderID}`);
      } else {
        api.sendMessage("⚠️ এই group ID pending approval list-এ নেই বা ইতিমধ্যে approved হয়ে গেছে!", senderID);
      }
    }
  }
};