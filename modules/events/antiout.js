
module.exports.config = {
  name: "antiout",
  eventType: ["log:unsubscribe"],
  version: "1.1.0",
  credits: "TOHIDUL (Enhanced by TOHI-BOT-HUB)",
  description: "Enhanced Anti-Out - Re-add users who leave with stylish notifications"
};

module.exports.run = async({ event, api, Threads, Users }) => {
  try {
    const { threadID } = event;
    let data = (await Threads.getData(threadID)).data || {};
    
    // Check if antiout is enabled
    if (data.antiout == false) return;
    
    // Don't process if bot itself left
    if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

    const leftUserId = event.logMessageData.leftParticipantFbId;
    const name = global.data.userName.get(leftUserId) || await Users.getNameUser(leftUserId);
    const type = (event.author == leftUserId) ? "self-separation" : "forced";
    const currentTime = new Date().toLocaleString("bn-BD", {
      timeZone: "Asia/Dhaka",
      hour12: false
    });

    if (type == "self-separation") {
      // Try to add user back
      api.addUserToGroup(leftUserId, threadID, (error, info) => {
        if (error) {
          console.error(`Failed to re-add user ${leftUserId}:`, error);
          
          // Send failure message with error handling
          const failureMsg = `
╔════════════════════════════╗
  😞 𝗥𝗘-𝗔𝗗𝗗 𝗙𝗔𝗜𝗟𝗘𝗗 😞
╚════════════════════════════╝

💔 ${name} কে ফিরিয়ে আনা যায়নি!

🔍 সম্ভাব্য কারণ:
┣━ মেসেঞ্জার অপশন বন্ধ আছে
┣━ বটকে ব্লক করেছে
┣━ প্রাইভেসি সেটিংস সীমিত
┗━ অন্য কোনো টেকনিক্যাল সমস্যা

💡 সমাধান:
┣━ ${name} কে বট আনব্লক করতে বলুন
┣━ ম্যানুয়ালি এড করার চেষ্টা করুন
┗━ প্রাইভেসি সেটিংস চেক করুন

🕒 সময়: ${currentTime}
────────────✦────────────
🚩 𝙈𝙖𝙙𝙚 𝙗𝙮 𝙏𝙊𝙃𝙄𝘿𝙐𝙇`;

          api.sendMessage(failureMsg, threadID, (err) => {
            if (err && err.error === 1545012) {
              console.log(`Bot is no longer in conversation ${threadID}, skipping message.`);
            }
          });
        } else {
          console.log(`Successfully re-added user ${leftUserId} to group ${threadID}`);
          
          // Send success message with error handling
          const successMsg = `
╔════════════════════════════╗
  🎯 𝗔𝗡𝗧𝗜-𝗢𝗨𝗧 𝗔𝗖𝗧𝗜𝗩𝗘 🎯
╚════════════════════════════╝

🔄 ${name}, তুমি সফলভাবে ফিরে এসেছো!

⚡ অটো রি-এড সিস্টেম কাজ করেছে:
┣━ তুমি গ্রুপ ছেড়েছিলে
┣━ Anti-Out ডিটেক্ট করেছে
┣━ তোমাকে আবার এড করা হয়েছে
┗━ এখন তুমি আবার আমাদের সাথে!

🛡️ এই গ্রুপে Anti-Out মোড সক্রিয় আছে।
💡 গ্রুপ ছাড়তে হলে এডমিনের পারমিশন নিন।

🕒 সময়: ${currentTime}
────────────✦────────────
🚩 𝙈𝙖𝙙𝙚 𝙗𝙮 𝙏𝙊𝙃𝙄𝘿𝙐𝙇`;

          api.sendMessage(successMsg, threadID, (err) => {
            if (err && err.error === 1545012) {
              console.log(`Bot is no longer in conversation ${threadID}, skipping message.`);
            }
          });
        }
      });
    } else {
      // User was kicked by admin - just log it
      console.log(`User ${name} was removed by admin in group ${threadID}`);
      
      const kickNotificationMsg = `
╔════════════════════════════╗
  👮‍♂️ 𝗔𝗗𝗠𝗜𝗡 𝗔𝗖𝗧𝗜𝗢𝗡 👮‍♂️
╚════════════════════════════╝

🚫 ${name} কে এডমিন রিমুভ করেছেন।

📋 Anti-Out মোড সক্রিয় থাকলেও:
┣━ এডমিন অ্যাকশনে হস্তক্ষেপ করবো না
┣━ শুধুমাত্র স্বেচ্ছায় লিভ নেওয়া ব্যক্তিদের ফেরত আনি
┗━ এডমিনের সিদ্ধান্তকে সম্মান করি

🕒 সময়: ${currentTime}
────────────✦────────────
🚩 𝙈𝙖𝙙𝙚 𝙗𝙮 𝙏𝙊𝙃𝙄𝘿𝙐𝙇`;

      api.sendMessage(kickNotificationMsg, threadID, (err) => {
        if (err && err.error === 1545012) {
          console.log(`Bot is no longer in conversation ${threadID}, skipping message.`);
        }
      });
    }
  } catch (error) {
    console.error('AntiOut Error:', error);
    
    // Send error notification
    const errorMsg = `
╔════════════════════════════╗
  ❌ 𝗔𝗡𝗧𝗜-𝗢𝗨𝗧 𝗘𝗥𝗥𝗢𝗥 ❌
╚════════════════════════════╝

⚠️ Anti-Out প্রসেসিং এ সমস্যা হয়েছে।
🔧 এডমিনকে জানান বা আবার চেষ্টা করুন।

🚩 𝙈𝙖𝙙𝙚 𝙗𝙮 𝙏𝙊𝙃𝙄𝘿𝙐𝙇`;
    
    api.sendMessage(errorMsg, event.threadID, (err) => {
      if (err && err.error === 1545012) {
        console.log(`Bot is no longer in conversation ${event.threadID}, skipping error message.`);
      }
    });
  }
}
