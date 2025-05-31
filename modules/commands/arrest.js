
const { join } = require("path");
const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");

module.exports.config = {
    name: "arrest",
    version: "0.0.1-xaviabot-port-refactor",
    hasPermssion: 0,
    usePrefix: true,
    commandCategory: "FUN",
    credits: "Joshua Sy",
    description: "Arrest a friend you mention",
    usages: "[tag]",
    cooldowns: 5
};

const arrestPath = join(__dirname, "cache", "arrest-template.png");

module.exports.onLoad = async function() {
    const axios = global.nodemodule["axios"];
    if (!fs.existsSync(arrestPath)) {
        try {
            const response = await axios.get("https://i.imgur.com/ep1gG3r.png", {
                responseType: 'arraybuffer'
            });
            fs.writeFileSync(arrestPath, Buffer.from(response.data));
        } catch (error) {
            console.log('[ARREST] Failed to download template:', error.message);
        }
    }
};

async function makeImage({ one, two }) {
    const axios = global.nodemodule["axios"];
    
    const template = await loadImage(arrestPath);

    let avatarPathOne = join(__dirname, "cache", `avt_arr_${one}.png`);
    let avatarPathTwo = join(__dirname, "cache", `avt_arr_${two}.png`);

    // Download avatars
    try {
        const avatarOneUrl = `https://graph.facebook.com/${one}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const avatarTwoUrl = `https://graph.facebook.com/${two}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        
        const avatarOneResponse = await axios.get(avatarOneUrl, { responseType: 'arraybuffer' });
        const avatarTwoResponse = await axios.get(avatarTwoUrl, { responseType: 'arraybuffer' });
        
        fs.writeFileSync(avatarPathOne, Buffer.from(avatarOneResponse.data));
        fs.writeFileSync(avatarPathTwo, Buffer.from(avatarTwoResponse.data));
    } catch (error) {
        throw new Error('Failed to download avatars');
    }

    const avatarOne = await loadImage(avatarPathOne);
    const avatarTwo = await loadImage(avatarPathTwo);

    // Create circular avatars
    const avatarOneCircle = await createCircleAvatar(avatarOne);
    const avatarTwoCircle = await createCircleAvatar(avatarTwo);

    const canvas = createCanvas(template.width, template.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(template, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(avatarOneCircle, 375, 9, 100, 100);
    ctx.drawImage(avatarTwoCircle, 160, 92, 100, 100);

    const pathImg = join(__dirname, "cache", `arrest_${one}_${two}.png`);
    const imageBuffer = canvas.toBuffer();

    // Clean up avatar files
    if (fs.existsSync(avatarPathOne)) fs.unlinkSync(avatarPathOne);
    if (fs.existsSync(avatarPathTwo)) fs.unlinkSync(avatarPathTwo);

    fs.writeFileSync(pathImg, imageBuffer);
    return pathImg;
}

async function createCircleAvatar(avatar) {
    const canvas = createCanvas(avatar.width, avatar.height);
    const ctx = canvas.getContext("2d");
    
    ctx.beginPath();
    ctx.arc(avatar.width / 2, avatar.height / 2, avatar.width / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    
    ctx.drawImage(avatar, 0, 0, avatar.width, avatar.height);
    
    return canvas;
}

module.exports.run = async function({ api, event, Users }) {
    const { senderID, mentions } = event;
    const mention = Object.keys(mentions);
    
    if (!mention[0]) {
        return api.sendMessage("Please tag a person.", event.threadID, event.messageID);
    }
    
    const one = senderID;
    const two = mention[0];
    const nameTarget = await Users.getNameUser(two);
    
    try {
        const path = await makeImage({ one, two });
        
        return api.sendMessage({
            body: `Congratulations on entering the state payroll ${nameTarget}\nWish you happy`,
            mentions: [
                {
                    tag: nameTarget,
                    id: two
                }
            ],
            attachment: fs.createReadStream(path)
        }, event.threadID, () => {
            // Clean up file after sending
            if (fs.existsSync(path)) fs.unlinkSync(path);
        }, event.messageID);
        
    } catch (error) {
        console.error('[ARREST] Error:', error);
        return api.sendMessage("An error occurred, please try again.", event.threadID, event.messageID);
    }
};
