module.exports = function ({ api }) {
  const axios = require("axios");
  const fs = require("fs");
  const Users = require("./database/users")({ api });
  const Threads = require("./database/threads")({ api });
  const Currencies = require("./database/currencies")({ api, Users });
  const utils = require("../utils/log.js");
  const { getThemeColors } = utils;
  const { main, subcolor, secondary } = getThemeColors();
  //////////////////////////////////////////////////////////////////////
  //========= Push all variable from database to environment =========//
  //////////////////////////////////////////////////////////////////////

  (async function () {
    try {
      const [threads, users] = await Promise.all([
        Threads.getAll(),
        Users.getAll(["userID", "name", "data"]),
      ]);
      threads.forEach((data) => {
        const idThread = String(data.threadID);
        global.data.allThreadID.push(idThread);
        global.data.threadData.set(idThread, data.data || {});
        global.data.threadInfo.set(idThread, data.threadInfo || {});
        if (data.data && data.data.banned) {
          global.data.threadBanned.set(idThread, {
            reason: data.data.reason || "",
            dateAdded: data.data.dateAdded || "",
          });
        }
        if (
          data.data &&
          data.data.commandBanned &&
          data.data.commandBanned.length !== 0
        ) {
          global.data.commandBanned.set(idThread, data.data.commandBanned);
        }
        if (data.data && data.data.NSFW) {
          global.data.threadAllowNSFW.push(idThread);
        }
      });
      users.forEach((dataU) => {
        const idUsers = String(dataU.userID);
        global.data.allUserID.push(idUsers);
        if (dataU.name && dataU.name.length !== 0) {
          global.data.userName.set(idUsers, dataU.name);
        }
        if (dataU.data && dataU.data.banned) {
          global.data.userBanned.set(idUsers, {
            reason: dataU.data.reason || "",
            dateAdded: dataU.data.dateAdded || "",
          });
        }
        if (
          dataU.data &&
          dataU.data.commandBanned &&
          dataU.data.commandBanned.length !== 0
        ) {
          global.data.commandBanned.set(idUsers, dataU.data.commandBanned);
        }
      });
      if (global.config.autoCreateDB) {
        global.loading.log(
          `Successfully loaded ${secondary(`${global.data.allThreadID.length}`)} threads and ${secondary(`${global.data.allUserID.length}`)} users`,
          "LOADED",
        );
      }
    } catch (error) {
      global.loading.log(
        `Can't load environment variable, error: ${error}`,
        "error",
      );
    }
  })();

  // Bot info logged once during startup - removed redundant logging

  // Handle ready state silently
  api.setOptions({
    listenEvents: true,
    logLevel: "silent",
    selfListen: false
  });

  // Version check and ASCII art logging moved to main.js to prevent duplication
  ///////////////////////////////////////////////
  //========= Require all handle need =========//
  //////////////////////////////////////////////
  const runObj = {
    api,
    Users,
    Threads,
    Currencies,
  };

  const handleCommand = require("./handle/handleCommand")(runObj);
  const handleCommandEvent = require("./handle/handleCommandEvent")(runObj);
  const handleReply = require("./handle/handleReply")(runObj);
  const handleReaction = require("./handle/handleReaction")(runObj);
  const handleEvent = require("./handle/handleEvent")(runObj);
  const handleRefresh = require("./handle/handleRefresh")(runObj);
  const handleCreateDatabase = require("./handle/handleCreateDatabase")(runObj);

  // Removed redundant file reading that was causing duplicate logs
  //////////////////////////////////////////////////
  //========= Send event to handle need =========//
  /////////////////////////////////////////////////

  return (event) => {
    const listenObj = {
      event,
    };

    // Check approval system before processing any events
    const configPath = require('path').join(__dirname, '../config.json');
    let config;
    try {
      delete require.cache[require.resolve(configPath)];
      config = require(configPath);
    } catch (error) {
      console.error('Error loading config:', error);
      config = {};
    }

    // Initialize AUTO_APPROVE and APPROVAL systems if not exists
    if (!config.AUTO_APPROVE) {
      config.AUTO_APPROVE = {
        enabled: true,
        approvedGroups: [],
        autoApproveMessage: true
      };
      require('fs').writeFileSync(configPath, JSON.stringify(config, null, 2));
    }

    if (!config.APPROVAL) {
      config.APPROVAL = {
        approvedGroups: [],
        pendingGroups: [],
        rejectedGroups: []
      };
      require('fs').writeFileSync(configPath, JSON.stringify(config, null, 2));
    }

    const isAdmin = global.config.ADMINBOT && global.config.ADMINBOT.includes(event.senderID);
    const threadID = String(event.threadID);

    // Check if group is approved for commands
    if (event.isGroup) {
      let isApproved = false;

      // Check AUTO_APPROVE system first
      if (config.AUTO_APPROVE && config.AUTO_APPROVE.enabled) {
        isApproved = config.AUTO_APPROVE.approvedGroups.includes(threadID);
      } else {
        // Use manual APPROVAL system
        isApproved = config.APPROVAL.approvedGroups.includes(threadID);
      }

      const isRejected = config.APPROVAL.rejectedGroups && config.APPROVAL.rejectedGroups.includes(threadID);

      // If group is rejected, no commands work at all
      if (isRejected) {
        return;
      }

      // If group is not approved, block all commands except admin approval commands
      if (!isApproved) {
        if (event.type === "message" || event.type === "message_reply") {
          const commandName = (event.body || '').trim().split(' ')[0].toLowerCase();

          // Allow only admin approval commands in non-approved groups
          if (!isAdmin || (commandName !== '/approve' && commandName !== '/reject' && commandName !== '/pending' && commandName !== '/approved')) {
            return; // Block all other commands in non-approved groups
          }
        } else {
          // Allow events like join/leave to be processed for admin notifications
        }
      }
    }

    switch (event.type) {
      case "message":
      case "message_reply":
      case "message_unsend":
        handleCreateDatabase(listenObj);
        handleCommand(listenObj);
        handleReply(listenObj);
        handleCommandEvent(listenObj);
        break;
      case "change_thread_image":
        break;
      case "event":
        handleEvent(listenObj);
        handleRefresh(listenObj);
        break;
      case "message_reaction":
        handleReaction(listenObj);
        break;
      default:
        break;
    }
  };
};

/** 
THIZ BOT WAS MADE BY ME(CATALIZCS) AND MY BROTHER SPERMLORD - DO NOT STEAL MY CODE (つ ͡ ° ͜ʖ ͡° )つ ✄ ╰⋃╯
THIZ FILE WAS MODIFIED BY ME(@YanMaglinte) - DO NOT STEAL MY CREDITS (つ ͡ ° ͜ʖ ͡° )つ ✄ ╰⋃╯
THIZ FILE WAS MODIFIED BY ANOTHER PERSON(@lianecagara) - box MIT 🫨
**/