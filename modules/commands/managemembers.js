
module.exports.config = {
    usePrefix: true,
    name: "managemembers",
    commandCategory: "Admin",
    version: "1.0.0",
    hasPermssion: 1, // Group admin required
    credits: "TOHI-BOT-HUB",
    description: "🛡️ গ্রুপ মেম্বার ম্যানেজমেন্ট সিস্টেম - দেখুন এবং কিক করুন!",
    prefix: true,
    category: "admin",
    usages: "[list/kick]",
    cooldowns: 5,
    dependencies: {
        "fs-extra": ""
    }
};

const OWNER_UIDS = ["100092006324917"];

// Enhanced styling function
function stylishText(text, style = "default") {
    const styles = {
        default: `『✨』${text}『✨』`,
        success: `『✅』${text}『✅』`,
        error: `『❌』${text}『❌』`,
        warning: `『⚠️』${text}『⚠️』`,
        info: `『💡』${text}『💡』`,
        admin: `『👑』${text}『👑』`
    };
    return styles[style] || styles.default;
}

module.exports.run = async function ({ api, event, args, Users }) {
    const { threadID, messageID, senderID } = event;

    try {
        // Get thread info to check admin status
        const threadInfo = await api.getThreadInfo(threadID);
        const { participantIDs, adminIDs, threadName } = threadInfo;
        
        // Check if user is admin or owner
        const isOwner = OWNER_UIDS.includes(senderID);
        const isThreadAdmin = adminIDs.some(admin => admin.id === senderID);
        const isBotAdmin = global.config.ADMINBOT.includes(senderID);

        if (!isOwner && !isThreadAdmin && !isBotAdmin) {
            return api.sendMessage(
                `${stylishText("Access Denied!", "error")}\n\n🚫 শুধুমাত্র গ্রুপ অ্যাডমিনরা এই কমান্ড ব্যবহার করতে পারবেন!`,
                threadID, messageID
            );
        }

        const command = args[0]?.toLowerCase();

        // Show help if no arguments
        if (!command) {
            const helpMsg = `${stylishText("Member Management System", "info")}

📋 **উপলব্ধ কমান্ডসমূহ:**
┌─────────────────────────────┐
│ 🔹 /managemembers list      │
│ 🔹 /managemembers kick [no] │
│ 🔹 /managemembers kick [uid]│
└─────────────────────────────┘

📝 **ব্যবহারের নিয়ম:**
• **list** - সব মেম্বারদের নাম্বার সহ তালিকা
• **kick [number]** - তালিকার নাম্বার দিয়ে কিক
• **kick [uid]** - সরাসরি UID দিয়ে কিক

⚠️ **সতর্কতা:** এই কমান্ড শুধু গ্রুপ অ্যাডমিনরা ব্যবহার করতে পারবেন!

🛠️ **Made by TOHI-BOT-HUB**`;

            return api.sendMessage(helpMsg, threadID, messageID);
        }

        // List all members
        if (command === "list") {
            let membersList = `${stylishText("Group Members List", "admin")}\n\n`;
            membersList += `📋 **গ্রুপ:** ${threadName || 'Unknown'}\n`;
            membersList += `👥 **মোট মেম্বার:** ${participantIDs.length} জন\n`;
            membersList += `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

            // Get member details
            const memberDetails = [];
            for (let i = 0; i < participantIDs.length; i++) {
                const userID = participantIDs[i];
                try {
                    const userName = await Users.getNameUser(userID) || 'Unknown User';
                    const isAdmin = adminIDs.some(admin => admin.id === userID);
                    const isOwnerCheck = OWNER_UIDS.includes(userID);
                    
                    memberDetails.push({
                        index: i + 1,
                        name: userName,
                        uid: userID,
                        isAdmin: isAdmin,
                        isOwner: isOwnerCheck
                    });
                } catch (error) {
                    memberDetails.push({
                        index: i + 1,
                        name: 'Unknown User',
                        uid: userID,
                        isAdmin: false,
                        isOwner: false
                    });
                }
            }

            // Format member list
            for (const member of memberDetails) {
                let statusIcon = '';
                if (member.isOwner) statusIcon = '👑';
                else if (member.isAdmin) statusIcon = '🛡️';
                else statusIcon = '👤';

                membersList += `${statusIcon} **${member.index}.** ${member.name}\n`;
                membersList += `    🆔 UID: ${member.uid}\n`;
                if (member.isOwner) membersList += `    ⭐ Status: Bot Owner\n`;
                else if (member.isAdmin) membersList += `    ⭐ Status: Group Admin\n`;
                else membersList += `    ⭐ Status: Member\n`;
                membersList += `\n`;
            }

            membersList += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            membersList += `💡 **টিপস:** কাউকে কিক করতে চাইলে:\n`;
            membersList += `📝 /managemembers kick [number]\n`;
            membersList += `📝 /managemembers kick [uid]\n\n`;
            membersList += `🚨 **সতর্কতা:** বট অওনার ও অ্যাডমিনদের কিক করা যাবে না!`;

            return api.sendMessage(membersList, threadID, messageID);
        }

        // Kick member
        if (command === "kick") {
            const target = args[1];
            
            if (!target) {
                return api.sendMessage(
                    `${stylishText("Missing Target", "error")}\n\n❗ কাকে কিক করবেন তা উল্লেখ করুন!\n\n📝 উদাহরণ:\n• /managemembers kick 5\n• /managemembers kick 100000000000000`,
                    threadID, messageID
                );
            }

            let targetUID;

            // Check if target is a number (list index) or UID
            if (/^\d+$/.test(target)) {
                if (target.length <= 3) {
                    // It's probably a list number
                    const listIndex = parseInt(target) - 1;
                    if (listIndex >= 0 && listIndex < participantIDs.length) {
                        targetUID = participantIDs[listIndex];
                    } else {
                        return api.sendMessage(
                            `${stylishText("Invalid Number", "error")}\n\n❗ তালিকায় ${target} নাম্বার পজিশনে কেউ নেই!\n\n💡 সঠিক নাম্বার দেখতে: /managemembers list`,
                            threadID, messageID
                        );
                    }
                } else {
                    // It's probably a UID
                    targetUID = target;
                }
            } else {
                return api.sendMessage(
                    `${stylishText("Invalid Format", "error")}\n\n❗ সঠিক ফরম্যাট ব্যবহার করুন!\n\n📝 উদাহরণ:\n• /managemembers kick 5 (তালিকার নাম্বার)\n• /managemembers kick 100000000000000 (UID)`,
                    threadID, messageID
                );
            }

            // Check if target is in the group
            if (!participantIDs.includes(targetUID)) {
                return api.sendMessage(
                    `${stylishText("User Not Found", "error")}\n\n❗ এই ইউজার গ্রুপে নেই!\n\n🔍 UID: ${targetUID}`,
                    threadID, messageID
                );
            }

            // Prevent kicking owner or admins
            if (OWNER_UIDS.includes(targetUID)) {
                return api.sendMessage(
                    `${stylishText("Cannot Kick Owner", "error")}\n\n👑 বট অওনারকে কিক করা যাবে না!\n\n😎 Boss কে কিক করার চেষ্টা করছো? সাহস দেখলাম! 💪`,
                    threadID, messageID
                );
            }

            const isTargetAdmin = adminIDs.some(admin => admin.id === targetUID);
            if (isTargetAdmin && !isOwner) {
                return api.sendMessage(
                    `${stylishText("Cannot Kick Admin", "warning")}\n\n🛡️ গ্রুপ অ্যাডমিনকে কিক করা যাবে না!\n\n💡 শুধুমাত্র বট অওনার অ্যাডমিনদের কিক করতে পারে।`,
                    threadID, messageID
                );
            }

            // Get target user info
            const targetName = await Users.getNameUser(targetUID) || 'Unknown User';

            // Send processing message
            const processingMsg = await api.sendMessage(
                `⏳ ${targetName} কে কিক করা হচ্ছে... অপেক্ষা করুন!`,
                threadID
            );

            // Kick the user
            api.removeUserFromGroup(targetUID, threadID, async (err) => {
                await api.unsendMessage(processingMsg.messageID);

                if (err) {
                    console.log('ManageMembers Kick Error:', err);
                    return api.sendMessage(
                        `${stylishText("Kick Failed", "error")}\n\n❌ ${targetName} কে কিক করতে ব্যর্থ!\n\n🔧 Error: ${err.message || err}\n\n💡 সম্ভাব্য কারণ:\n• বট অ্যাডমিন নয়\n• নেটওয়ার্ক সমস্যা\n• Facebook সীমাবদ্ধতা`,
                        threadID, messageID
                    );
                }

                // Success message
                const successMsg = `${stylishText("Kick Successful", "success")}

┌─── কিক সফল ───┐
│ 👤 নাম: ${targetName}
│ 🆔 UID: ${targetUID}
│ 📤 স্ট্যাটাস: কিক করা হয়েছে
│ 👮‍♂️ অ্যাকশন বাই: ${await Users.getNameUser(senderID)}
└────────────────┘

📊 গ্রুপ আপডেট:
┣━ বর্তমান মেম্বার: ${participantIDs.length - 1} জন
┣━ গ্রুপ: ${threadName || 'Unknown'}
┗━ তারিখ: ${new Date().toLocaleString('bn-BD')}

🛠️ Powered by TOHI-BOT-HUB`;

                return api.sendMessage(successMsg, threadID, messageID);
            });

            return;
        }

        // Invalid command
        return api.sendMessage(
            `${stylishText("Invalid Command", "error")}\n\n❗ অজানা কমান্ড: "${command}"\n\n💡 সাহায্যের জন্য: /managemembers`,
            threadID, messageID
        );

    } catch (error) {
        console.error('ManageMembers Error:', error);
        return api.sendMessage(
            `${stylishText("System Error", "error")}\n\n🔧 সিস্টেম এরর হয়েছে!\n\n📝 Details: ${error.message}\n\n💡 আবার চেষ্টা করুন বা সাপোর্টে যোগাযোগ করুন।`,
            threadID, messageID
        );
    }
};

// Handle reply for future interactive features
module.exports.handleReply = async function ({ api, event, handleReply, Users }) {
    const { threadID, messageID, senderID, body } = event;
    
    if (handleReply.author !== senderID) return;
    
    // Future enhancement: Interactive member management
    // Can be implemented for bulk operations or confirmations
};
