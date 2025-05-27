module.exports.config = {
  name: "antijoin",
  eventType: ["log:subscribe"],
  version: "1.2.0",
  credits: "TOHIDUL (original by ইসলামিক চ্যাট বট)",
  description: "নতুন সদস্য অ্যাড হলে গ্রুপ থেকে অটো রিমুভ (Anti Join mode)"
};

module.exports.run = async function ({ event, api, Threads, Users }) {
  try {
    let data = (await Threads.getData(event.threadID)).data;
    if (data.newMember !== true) return;
    if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) return;

    const memJoin = event.logMessageData.addedParticipants.map(info => info.userFbId);

    for (let idUser of memJoin) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      api.removeUserFromGroup(idUser, event.threadID, async function (err) {
        if (err) {
          data["newMember"] = false;
        }
        await Threads.setData(event.threadID, { data });
        global.data.threadData.set(event.threadID, data);
      });
    }

    // STYLISH BANGLA, BOX STYLE, EMOJI, BOLD
    const msg = `
╔════════════════════╗
  🚫 𝘼𝙉𝙏𝙄 𝙅𝙊𝙄𝙉 𝙈𝙊𝘿𝙀 🚫
╚════════════════════╝

┏━━━━━━━━━━━━━━━━━━━━┓
┃  🛡️ গ্রুপে Anti Join মোড চালু রয়েছে!
┃
┃  👤 নতুন সদস্য অ্যাড করা যাবে না।
┃  
┃  ⚠️ দয়া করে আগে Anti Join মোড বন্ধ করুন,
┃     তারপর সদস্য অ্যাড করুন।
┗━━━━━━━━━━━━━━━━━━━━┛

🕒 সময়: ${new Date().toLocaleTimeString("bn-BD")}
🚩 𝙈𝙖𝙙𝙚 𝙗𝙮 𝙏𝙊𝙃𝙄𝘿𝙐𝙇
`;

    return api.sendMessage(msg, event.threadID);
  } catch (e) {
    console.error('AntiJoin Error:', e);
  }
}