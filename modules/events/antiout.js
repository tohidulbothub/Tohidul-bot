module.exports.config = {
  name: "antiout",
  eventType: ["log:unsubscribe"],
  version: "1.0.0",
  credits: "TOHIDUL (original: CYBER BOT TEAM)",
  description: "গ্রুপ ছাড়লে stylish message দিয়ে আবার এড করে"
};

module.exports.run = async({ event, api, Threads, Users }) => {
  let data = (await Threads.getData(event.threadID)).data || {};
  if (data.antiout == false) return;
  if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

  const name = global.data.userName.get(event.logMessageData.leftParticipantFbId) 
    || await Users.getNameUser(event.logMessageData.leftParticipantFbId);

  const type = (event.author == event.logMessageData.leftParticipantFbId) ? "self-separation" : "forced";

  if (type == "self-separation") {
    api.addUserToGroup(event.logMessageData.leftParticipantFbId, event.threadID, (error, info) => {
      if (error) {
        // Couldn't add back (maybe blocked)
        api.sendMessage(
`╔════════════════════════════╗
  😥 𝗢𝗼𝗽𝘀! ${name} কে ফিরিয়ে আনা গেল না!
╚════════════════════════════╝

• হয় আইডিতে মেসেঞ্জার অপশন নাই
• না হয় ${name} বটকে ব্লক করেছে!

🚫 দয়া করে unblock করে আবার চেষ্টা করুন!

────────────✦────────────
🚩 𝙈𝙖𝙙𝙚 𝙗𝙮 𝙏𝙊𝙃𝙄𝘿𝙐𝙇`, event.threadID
        );
      } else {
        // Added back successfully
        api.sendMessage(
`╔════════════════════════════╗
  😎 𝗚𝗥𝗢𝗨𝗣 𝗣𝗢𝗟𝗜𝗖𝗬 𝗔𝗖𝗧𝗜𝗩𝗘 😎
╚════════════════════════════╝

${name}, এই গ্রুপ হইলো গ্যাং! 🚨
এখান থেকে যেতে হলে এডমিনের পারমিশন লাগে!

তুমি বিনা পারমিশনে লিভ নিয়েছো —
তোমাকে আবার মাফিয়া স্টাইলে এড দিলাম! 🔄

────────────✦────────────
🚩 𝙈𝙖𝙙𝙚 𝙗𝙮 𝙏𝙊𝙃𝙄𝘿𝙐𝙇`, event.threadID
        );
      }
    });
  }
}