module.exports.config = {
	usePrefix: true,
    name: "adduser",
    commandCategory: "Admin",
    version: "1.0.3",
    hasPermssion: 2, // এখন শুধুমাত্র অ্যাডমিন (bot admin) ব্যবহার করতে পারবে
    credits: "TOHI-BOT-HUB",
    description: "🌟 fb লিংক বা UID দিয়ে গ্রুপে নতুন ইউজার অ্যাড করুন! 🌟",
    prefix: true,
    category: "admin",
    usages: "<লিংক/UID>",
    cooldowns: 5
};

function stylish(txt) {
  return `『✨』${txt.split('').join(' ')}『✨'`;
}

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const axios = require('axios');
    const link = args.join(" ");

    // এক্সট্রা সেফটি: অ্যাডমিন চেক (যদি কেউ config.hasPermssion না মানে)
    const botAdmins = global.config.ADMINBOT || []; // তোমার বট config.js এ ADMINBOT array থাকে
    if (!botAdmins.includes(senderID)) {
      return api.sendMessage(
        `⛔️ ${stylish("এই কমান্ডটি শুধুমাত্র বট অ্যাডমিনদের জন্য!")}\n\n⚡️ অনুমতি নেই!`, 
        threadID, messageID
      );
    }

    const emojiAdd = "➕";
    const emojiWarn = "⚠️";
    const emojiError = "❌";
    const emojiDone = "✅";
    const emojiUser = "👤";
    const emojiBox = "💬";
    const emojiWait = "⏳";
    const emojiAdmin = "🛡️";

    if (!args[0]) 
        return api.sendMessage(`${emojiWarn} ${stylish("দয়া করে Facebook লিংক বা UID দিন!")}\n\nউদাহরণ:\n${emojiBox} /adduser 10000xxxxxx\n${emojiBox} /adduser https://facebook.com/username`, threadID, messageID);

    const threadInfo = await api.getThreadInfo(threadID);
    const participantIDs = threadInfo.participantIDs;
    const approvalMode = threadInfo.approvalMode;
    const adminIDs = threadInfo.adminIDs;

    let uidUser;

    // যদি লিংক দেয়
    if (link.indexOf(".com/") !== -1) {
        try {
            const res = await axios.get(`https://golike.com.vn/func-api.php?user=${link}`);
            uidUser = res.data.data.uid;
            if (!uidUser) return api.sendMessage(`${emojiError} ${stylish("ইউজার খুঁজে পাওয়া যায়নি!")}`, threadID, messageID);
        } catch (e) {
            return api.sendMessage(`${emojiError} ${stylish("লিংক থেকে UID বের করতে সমস্যা হয়েছে!")}`, threadID, messageID);
        }
    } else {
        // UID দিয়েছে
        uidUser = args[0];
    }

    // যদি আগে থেকেই গ্রুপে থাকে
    if (participantIDs.includes(uidUser)) 
        return api.sendMessage(`🌸 ${emojiUser} ${stylish("ইউজার ইতিমধ্যেই গ্রুপে আছে!")} 🌸`, threadID, messageID);

    // অ্যাড করার চেষ্টা
    api.addUserToGroup(uidUser, threadID, (err) => {
        if (err)
            return api.sendMessage(`${emojiError} ${stylish("ইউজার অ্যাড করতে সমস্যা হয়েছে!")}`, threadID, messageID);
        else if (approvalMode && !adminIDs.some(item => item.id == api.getCurrentUserID()))
            return api.sendMessage(`${emojiWait} ${stylish("ইউজার অ্যাড হয়েছে, এখন অ্যাডমিনের অনুমোদনের অপেক্ষায়!")} ${emojiAdmin}`, threadID, messageID);
        else
            return api.sendMessage(`${emojiDone} ${emojiUser} ${stylish("নতুন সদস্য সফলভাবে গ্রুপে যুক্ত হয়েছে!")} ${emojiAdd}\n\n🛠️ 𝑴𝒂𝒅𝒆 𝒃𝒚 𝒕𝒐𝒉𝒊𝒅𝒖𝒍`, threadID, messageID);
    });
};
