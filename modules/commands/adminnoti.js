const fs = require('fs');
const request = require('request');

module.exports.config = {
    name: "adminnoti",
    version: "1.0.2",
    permission: 2,
    credits: "TOHI-BOT-HUB",
    description: "✨ এডমিন নোটিফিকেশন: সকল গ্রুপে স্টাইলিশ মেসেজ পাঠান!",
    usePrefix: true,
    category: "sent msg",
    usages: "[মেসেজ]",
    cooldowns: 5,
    commandCategory: "Admin"
}

let atmDir = [];

const getAtm = (atm, body) => new Promise(async (resolve) => {
    let msg = {}, attachment = [];
    msg.body = body;
    for(let eachAtm of atm) {
        await new Promise(async (resolve) => {
            try {
                let response =  await request.get(eachAtm.url),
                    pathName = response.uri.pathname,
                    ext = pathName.substring(pathName.lastIndexOf(".") + 1),
                    path = __dirname + `/cache/${eachAtm.filename}.${ext}`
                response
                    .pipe(fs.createWriteStream(path))
                    .on("close", () => {
                        attachment.push(fs.createReadStream(path));
                        atmDir.push(path);
                        resolve();
                    })
            } catch(e) { console.log(e); }
        })
    }
    msg.attachment = attachment;
    resolve(msg);
})

module.exports.handleReply = async function ({ api, event, handleReply, Users, Threads }) {
    const moment = require("moment-timezone");
    var gio = moment.tz("Asia/Dhaka").format("DD/MM/YYYY - HH:mm:ss");
    const { threadID, messageID, senderID, body } = event;
    let name = await Users.getNameUser(senderID);
    switch (handleReply.type) {
        case "sendnoti": {
            let text = `💬 『𝑨𝒅𝒎𝒊𝒏 𝑨𝒏𝒏𝒐𝒖𝒏𝒄𝒆 𝑹𝒆𝒑𝒍𝒚』\n━━━━━━━━━━━━━━━\n👤 𝙐𝙨𝙚𝙧: ${name}\n🕒 𝙏𝙞𝙢𝙚: ${gio}\n\n💬 𝙍𝙚𝙥𝙡𝙮: ${body}\n\n🏠 𝙂𝙧𝙤𝙪𝙥: ${(await Threads.getInfo(threadID)).threadName || "unknown"}\n━━━━━━━━━━━━━━━\n\n🛠️ 𝑴𝒂𝒅𝒆 𝒃𝒚 𝒕𝒐𝒉𝒊𝒅𝒖𝒍`;
            if(event.attachments.length > 0) text = await getAtm(event.attachments, `💬 『𝑨𝒅𝒎𝒊𝒏 𝑨𝒏𝒏𝒐𝒖𝒏𝒄𝒆 𝑹𝒆𝒑𝒍𝒚』\n━━━━━━━━━━━━━━━\n👤 𝙐𝙨𝙚𝙧: ${name}\n🕒 𝙏𝙞𝙢𝙚: ${gio}\n\n💬 𝙍𝙚𝙥𝒍𝒚: ${body}\n\n🏠 𝙂𝙧𝙤𝙪𝙥: ${(await Threads.getInfo(threadID)).threadName || "unknown"}\n━━━━━━━━━━━━━━━\n\n🛠️ 𝑴𝒂𝒅𝒆 𝒃𝒚 𝒕𝒐𝒉𝒊𝒅𝒖𝒍`);
            api.sendMessage(text, handleReply.threadID, (err, info) => {
                atmDir.forEach(each => fs.unlinkSync(each))
                atmDir = [];
                global.client.handleReply.push({
                    name: this.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    messID: messageID,
                    threadID
                })
            });
            break;
        }
        case "reply": {
            let text = `👑『𝑨𝒅𝒎𝒊𝒏 𝑹𝒆𝒑𝒍𝒚』\n━━━━━━━━━━━━━━━\n👤 𝑨𝒅𝒎𝒊𝒏: ${name}\n\n💬 𝙍𝙚𝙥𝒍𝒚: ${body}\n\n🔁 𝙆𝙤𝙣𝙤 𝙥𝙧𝙤𝙨𝙣𝙤 𝙩𝙝𝙖𝙠𝙚 𝙧𝙚𝙥𝒍𝒚 𝙠𝙤𝙧𝙤!\n━━━━━━━━━━━━━━━\n\n🛠️ 𝑴𝒂𝒅𝒆 𝒃𝒚 𝒕𝒐𝒉𝒊𝒅𝒖𝒍`;
            if(event.attachments.length > 0) text = await getAtm(event.attachments, `👑『𝑨𝒅𝒎𝒊𝒏 𝑹𝒆𝒑𝒍𝒚』\n━━━━━━━━━━━━━━━\n👤 𝑨𝒅𝒎𝒊𝒏: ${name}\n\n💬 𝙍𝙚𝙥𝒍𝒚: ${body}\n\n🔁 𝙆𝙤𝙣𝙤 𝙥𝙧𝙤𝙨𝙣𝙤 𝙩𝙝𝙖𝙠𝙚 𝙧𝙚𝙥𝒍𝒚 𝙠𝙤𝙧𝙤!\n━━━━━━━━━━━━━━━\n\n🛠️ 𝑴𝒂𝒅𝒆 𝒃𝒚 𝒕𝒐𝒉𝒊𝒅𝒖𝒍`);
            api.sendMessage(text, handleReply.threadID, (err, info) => {
                atmDir.forEach(each => fs.unlinkSync(each))
                atmDir = [];
                global.client.handleReply.push({
                    name: this.config.name,
                    type: "sendnoti",
                    messageID: info.messageID,
                    threadID
                })
            }, handleReply.messID);
            break;
        }
    }
}

module.exports.run = async function ({ api, event, args, Users }) {
    const moment = require("moment-timezone");
    var gio = moment.tz("Asia/Dhaka").format("DD/MM/YYYY - HH:mm:ss");
    const { threadID, messageID, senderID, messageReply } = event;
    if (!args[0]) return api.sendMessage("⚠️ 『𝑷𝒍𝒆𝒂𝒔𝒆 𝒊𝒏𝒑𝒖𝒕 𝒚𝒐𝒖𝒓 𝒎𝒆𝒔𝒔𝒂𝒈𝒆!』\n\n🛠️ 𝑴𝒂𝒅𝒆 𝒃𝒚 𝒕𝒐𝒉𝒊𝒅𝒖𝒍", threadID);
    let allThread = global.data.allThreadID || [];
    let can = 0, canNot = 0;
    let text = `📢『𝑨𝒅𝒎𝒊𝒏 𝑵𝒐𝒕𝒊𝒇𝒊𝒄𝒂𝒕𝒊𝒐𝒏』\n━━━━━━━━━━━━━━━\n👑 𝑨𝒅𝒎𝒊𝒏: ${await Users.getNameUser(senderID)}\n🕒 𝙏𝙞𝙢𝙚: ${gio}\n\n💬 𝙈𝙚𝙨𝙨𝙖𝙜𝙚: ${args.join(" ")}\n━━━━━━━━━━━━━━━\n\n🔁 𝙍𝙚𝙥𝒍𝒚 𝙠𝙤𝙧𝙚 𝙥𝙧𝙤𝙨𝙣𝙤 𝙠𝙤𝙧𝙤!\n\n🛠️ 𝑴𝒂𝒅𝒆 𝒃𝒚 𝒕𝒐𝒉𝒊𝒅𝒖𝒍`;
    if(event.type == "message_reply") text = await getAtm(messageReply.attachments, `📢『𝑨𝒅𝒎𝒊𝒏 𝑵𝒐𝒕𝒊𝒇𝒊𝒄𝒂𝒕𝒊𝒐𝒏』\n━━━━━━━━━━━━━━━\n👑 𝑨𝒅𝒎𝒊𝒏: ${await Users.getNameUser(senderID)}\n🕒 𝙏𝙞𝙢𝙚: ${gio}\n\n💬 𝙈𝙚𝙨𝙨𝙖𝙜𝙚: ${args.join(" ")}\n━━━━━━━━━━━━━━━\n\n🔁 𝙍𝙚𝙥𝒍𝒚 𝙠𝙤𝙧𝙚 𝙥𝙧𝙤𝙨𝙣𝙤 𝙠𝙤𝙧𝙤!\n\n🛠️ 𝑴𝒂𝒅𝒆 𝒃𝒚 𝒕𝒐𝒉𝒊𝒅𝒖𝒍`);
    await new Promise(resolve => {
        allThread.forEach((each) => {
            try {
                api.sendMessage(text, each, (err, info) => {
                    if(err) { canNot++; }
                    else {
                        can++;
                        atmDir.forEach(each => fs.unlinkSync(each))
                        atmDir = [];
                        global.client.handleReply.push({
                            name: this.config.name,
                            type: "sendnoti",
                            messageID: info.messageID,
                            threadID
                        })
                        resolve();
                    }
                })
            } catch(e) { console.log(e) }
        })
    })
    api.sendMessage(`✅『𝑺𝒆𝒏𝒕 𝒕𝒐: ${can} 𝒕𝒉𝒓𝒆𝒂𝒅 ・ ❌ 𝑵𝒐𝒕 𝒔𝒆𝒏𝒕 𝒕𝒐: ${canNot} 𝒕𝒉𝒓𝒆𝒂𝒅』\n\n🛠️ 𝑴𝒂𝒅𝒆 𝒃𝒚 𝒕𝒐𝒉𝒊𝒅𝒖𝒍`, threadID);
}