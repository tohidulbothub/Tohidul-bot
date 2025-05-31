
module.exports = {
  config: {
    name: "busy",
    version: "2.0.0",
    hasPermssion: 0,
    usePrefix: true,
    credits: "TOHI-BOT-HUB",
    description: "🚫 Do not disturb mode - Bot will notify when you're tagged",
    commandCategory: "utility",
    cooldowns: 3,
    usages: "[reason] or off"
  },

  run: async function ({ api, event, args, Users, getLang }) {
    const { senderID, threadID, messageID } = event;
    
    try {
      // Check if user wants to turn off busy mode
      if (args[0] && args[0].toLowerCase() === "off") {
        const userData = await Users.getData(senderID);
        if (userData.data && userData.data.busy !== undefined) {
          delete userData.data.busy;
          await Users.setData(senderID, userData);
          
          return api.sendMessage(
            `✅ **Busy Mode Disabled**\n\n` +
            `🔓 ব্যস্ততার মোড বন্ধ করা হয়েছে!\n` +
            `📢 এখন কেউ আপনাকে ট্যাগ করলে কোনো বার্তা পাঠানো হবে না।\n\n` +
            `🚩 Made by TOHIDUL`,
            threadID, messageID
          );
        } else {
          return api.sendMessage(
            `❌ **Already Disabled**\n\n` +
            `📝 আপনার Busy Mode আগে থেকেই বন্ধ আছে।\n\n` +
            `💡 চালু করতে: \`/busy [কারণ]\`\n` +
            `🚩 Made by TOHIDUL`,
            threadID, messageID
          );
        }
      }

      // Get the reason for being busy
      const reason = args.join(" ") || "";
      
      // Set busy mode
      const userData = await Users.getData(senderID);
      if (!userData.data) userData.data = {};
      userData.data.busy = reason || true;
      await Users.setData(senderID, userData);

      // Get user info for response
      const userInfo = await api.getUserInfo(senderID);
      const userName = userInfo[senderID].name;

      const successMessage = reason ? 
        `✅ **Busy Mode Activated**\n\n` +
        `🚫 ${userName} এখন ব্যস্ত!\n` +
        `📝 **কারণ:** ${reason}\n\n` +
        `💬 কেউ আপনাকে ট্যাগ করলে এই বার্তা দেখানো হবে।\n` +
        `🔓 বন্ধ করতে: \`/busy off\`\n\n` +
        `🚩 Made by TOHIDUL`
        :
        `✅ **Busy Mode Activated**\n\n` +
        `🚫 ${userName} এখন ব্যস্ত!\n` +
        `📝 **কারণ:** কোনো কারণ উল্লেখ করা হয়নি\n\n` +
        `💬 কেউ আপনাকে ট্যাগ করলে এই বার্তা দেখানো হবে।\n` +
        `🔓 বন্ধ করতে: \`/busy off\`\n\n` +
        `🚩 Made by TOHIDUL`;

      return api.sendMessage(successMessage, threadID, messageID);

    } catch (error) {
      console.error('[BUSY] Command error:', error);
      return api.sendMessage(
        `❌ **System Error**\n\n` +
        `🔧 Busy মোড সেট করতে সমস্যা হয়েছে।\n` +
        `💡 আবার চেষ্টা করুন।\n\n` +
        `🚩 Made by TOHIDUL`,
        threadID, messageID
      );
    }
  },

  // Handle when someone mentions a busy user
  onChat: async function ({ api, event, Users }) {
    const { mentions, threadID, messageID } = event;

    // Check if there are any mentions
    if (!mentions || Object.keys(mentions).length === 0) return;

    try {
      // Check each mentioned user
      for (const [userID, mentionText] of Object.entries(mentions)) {
        const userData = await Users.getData(userID);
        
        // Check if user is in busy mode
        if (userData.data && userData.data.busy !== undefined) {
          const userInfo = await api.getUserInfo(userID);
          const userName = userInfo[userID].name;
          const busyReason = userData.data.busy;

          // Create busy notification message
          let busyMessage;
          if (typeof busyReason === 'string' && busyReason.trim()) {
            busyMessage = 
              `🚫 **User is Busy** 🚫\n\n` +
              `👤 **${userName}** এখন ব্যস্ত আছেন\n` +
              `📝 **কারণ:** ${busyReason}\n\n` +
              `⏰ তিনি ফ্রি হলে উত্তর দেবেন\n` +
              `🙏 দয়া করে অপেক্ষা করুন\n\n` +
              `🚩 Made by TOHIDUL`;
          } else {
            busyMessage = 
              `🚫 **User is Busy** 🚫\n\n` +
              `👤 **${userName}** এখন ব্যস্ত আছেন\n` +
              `📝 **কারণ:** তিনি কোনো কারণ উল্লেখ করেননি\n\n` +
              `⏰ তিনি ফ্রি হলে উত্তর দেবেন\n` +
              `🙏 দয়া করে অপেক্ষা করুন\n\n` +
              `🚩 Made by TOHIDUL`;
          }

          // Send the busy notification
          return api.sendMessage(busyMessage, threadID, messageID);
        }
      }
    } catch (error) {
      console.error('[BUSY] OnChat error:', error);
      // Don't send error message for onChat to avoid spam
    }
  }
};
