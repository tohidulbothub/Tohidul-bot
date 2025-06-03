let activeCmd = false;

module.exports = function ({ api, models, Users, Threads, Currencies, ...rest }) {
  const stringSimilarity = require("string-similarity");
  const moment = require("moment-timezone");
  const logger = require("../../utils/log");

  // Cache for frequently accessed data
  const commandCache = new Map();
  const cooldownCache = new Map();

  const OWNER_UIDS = ["100092006324917"];

    // Protected commands that can't be used against the owner
    const PROTECTED_COMMANDS = ["toilet", "hack", "arrest", "ban", "kick"];

    return async function ({ event, ...rest2 }) {
    if (activeCmd) {
      return;
    }

    // Quick return for non-command messages
    if (!event.body || typeof event.body !== 'string') {
      return;
    }

    // Check approval system before executing any command
    const fs = require('fs');
    const path = require('path');
    const configPath = path.join(__dirname, '../../config.json');

    try {
      delete require.cache[require.resolve(configPath)];
      const config = require(configPath);

      if (event.isGroup) {
        const threadID = event.threadID;
        const isAdmin = global.config.ADMINBOT.includes(event.senderID);

        // Check if AUTO_APPROVE system is enabled
        if (config.AUTO_APPROVE && config.AUTO_APPROVE.enabled) {
          // Auto-approve system: automatically approve any group the bot is in
          if (!config.AUTO_APPROVE.approvedGroups.includes(threadID)) {
            config.AUTO_APPROVE.approvedGroups.push(threadID);
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
          }
          // All commands work in auto-approve mode
        } else {
          // Manual approval system: use the old APPROVAL system
          if (config.APPROVAL) {
            // Initialize APPROVAL object if it doesn't exist
            if (!config.APPROVAL.approvedGroups) {
              config.APPROVAL.approvedGroups = [];
              fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            }

            // If group is not approved, block all commands except /approve for admins
            if (!config.APPROVAL.approvedGroups.includes(threadID)) {
              if (!isAdmin) {
                return; // Non-admins can't use any commands in non-approved groups
              }

              // For admins, only allow /approve command in non-approved groups
              const commandName = (event.body || '').trim().split(' ')[0];
              if (commandName !== '/approve') {
                return; // Only allow /approve command for admins in non-approved groups
              }
            }
          }
        }
      }
    } catch (error) {
      console.log("Error checking approval system:", error);
    }

    const dateNow = Date.now();
    const time = moment.tz("Asia/Manila").format("HH:MM:ss DD/MM/YYYY");
    const { allowInbox, PREFIX, ADMINBOT, DeveloperMode, adminOnly } = global.config;
    const { userBanned, threadBanned, threadInfo, commandBanned } = global.data;
    const { commands } = global.client;

    var { body, senderID, threadID, messageID } = event;
    var senderID = String(senderID),
      threadID = String(threadID);

    const args = (body || "").trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();
    var command = commands.get(commandName);
    const replyAD = "[ MODE ] - Only bot admin can use bot";

    if (
      command &&
      command.config.name.toLowerCase() === commandName.toLowerCase() &&
      !ADMINBOT.includes(senderID) &&
      adminOnly &&
      senderID !== api.getCurrentUserID()
    ) {
      return api.sendMessage(replyAD, threadID, messageID);
    }

    if (
      typeof body === "string" &&
      body.startsWith(PREFIX) &&
      !ADMINBOT.includes(senderID) &&
      adminOnly &&
      senderID !== api.getCurrentUserID()
    ) {
      return api.sendMessage(replyAD, threadID, messageID);
    }

    if (
      userBanned.has(senderID) ||
      threadBanned.has(threadID) ||
      (allowInbox == ![] && senderID == threadID)
    ) {
      if (!ADMINBOT.includes(senderID.toString())) {
        if (userBanned.has(senderID)) {
          const { reason, dateAdded } = userBanned.get(senderID) || {};
          return api.sendMessage(
            global.getText("handleCommand", "userBanned", reason, dateAdded),
            threadID,
            async (err, info) => {
              await new Promise((resolve) => setTimeout(resolve, 5 * 1000));
              return api.unsendMessage(info.messageID);
            },
            messageID,
          );
        } else {
          if (threadBanned.has(threadID)) {
            const { reason, dateAdded } = threadBanned.get(threadID) || {};
            return api.sendMessage(
              global.getText(
                "handleCommand",
                "threadBanned",
                reason,
                dateAdded,
              ),
              threadID,
              async (_, info) => {
                await new Promise((resolve) => setTimeout(resolve, 5 * 1000));
                return api.unsendMessage(info.messageID);
              },
              messageID,
            );
          }
        }
      }
    }

    if (commandName.startsWith(PREFIX)) {
      // Skip if only prefix is sent
      if (commandName === PREFIX) {
        return;
      }

      const cmdName = commandName.slice(PREFIX.length).toLowerCase();

      if (!command) {
        // First check for exact command name match
        command = commands.get(cmdName);

        // If not found, check for aliases
        if (!command) {
          for (const [name, cmdModule] of commands.entries()) {
            if (cmdModule.config && cmdModule.config.aliases && Array.isArray(cmdModule.config.aliases)) {
              if (cmdModule.config.aliases.some(alias => alias.toLowerCase() === cmdName)) {
                command = cmdModule;
                break;
              }
            }
          }
        }

        // If still not found, try similarity matching
        if (!command) {
          const allCommandNames = [];
          // Add command names
          for (const [name, cmdModule] of commands.entries()) {
            allCommandNames.push(name);
            // Add aliases
            if (cmdModule.config && cmdModule.config.aliases && Array.isArray(cmdModule.config.aliases)) {
              allCommandNames.push(...cmdModule.config.aliases);
            }
          }

          const checker = stringSimilarity.findBestMatch(cmdName, allCommandNames);
          if (checker.bestMatch.rating >= 0.5) {
            // Find the command by name or alias
            const matchedName = checker.bestMatch.target;
            command = commands.get(matchedName);
            if (!command) {
              // Check if it's an alias
              for (const [name, cmdModule] of commands.entries()) {
                if (cmdModule.config && cmdModule.config.aliases && Array.isArray(cmdModule.config.aliases)) {
                  if (cmdModule.config.aliases.includes(matchedName)) {
                    command = cmdModule;
                    break;
                  }
                }
              }
            }
          } else {
            return; // Simply ignore invalid commands
          }
        }
      }
    } else {
      // Handle commands without prefix (usePrefix: false)
      if (!command) {
        const firstWord = body.trim().split(' ')[0].toLowerCase();

        // Check for exact command name match
        for (const [cmdName, cmdModule] of commands.entries()) {
          if (cmdModule.config && cmdModule.config.usePrefix === false && 
              cmdName.toLowerCase() === firstWord) {
            command = cmdModule;
            break;
          }
        }

        // If not found, check for aliases
        if (!command) {
          for (const [cmdName, cmdModule] of commands.entries()) {
            if (cmdModule.config && cmdModule.config.usePrefix === false && 
                cmdModule.config.aliases && Array.isArray(cmdModule.config.aliases)) {
              if (cmdModule.config.aliases.some(alias => alias.toLowerCase() === firstWord)) {
                command = cmdModule;
                break;
              }
            }
          }
        }
      }
    }

    if (commandBanned.get(threadID) || commandBanned.get(senderID)) {
      if (!ADMINBOT.includes(senderID)) {
        const banThreads = commandBanned.get(threadID) || [],
          banUsers = commandBanned.get(senderID) || [];
        if (banThreads.includes(command.config.name))
          return api.sendMessage(
            global.getText(
              "handleCommand",
              "commandThreadBanned",
              command.config.name,
            ),
            threadID,
            async (_, info) => {
              await new Promise((resolve) => setTimeout(resolve, 5 * 1000));
              return api.unsendMessage(info.messageID);
            },
            messageID,
          );
        if (banUsers.includes(command.config.name))
          return api.sendMessage(
            global.getText(
              "handleCommand",
              "commandUserBanned",
              command.config.name,
            ),
            threadID,
            async (_, info) => {
              await new Promise((resolve) => setTimeout(resolve, 5 * 1000));
              return api.unsendMessage(info.messageID);
            },
            messageID,
          );
      }
    }

    if (command && command.config && command.config.usePrefix !== undefined) {
        command.config.usePrefix = command.config.usePrefix ?? true;
    }

    if (command && command.config) {
      // For commands with usePrefix: false, check if the command name matches exactly
      if (command.config.usePrefix === false) {
        const firstWord = body.trim().split(' ')[0].toLowerCase();
        const isCommandMatch = firstWord === command.config.name.toLowerCase() || 
          (command.config.aliases && Array.isArray(command.config.aliases) && 
           command.config.aliases.some(alias => alias.toLowerCase() === firstWord));

        if (!isCommandMatch) {
          return; // Silently ignore if not matching
        }

        // Update args for non-prefix commands
        const tempArgs = body.trim().split(/ +/);
        tempArgs.shift(); // Remove the command name

        // Clear existing args and add new ones
        while (args.length > 0) {
          args.pop();
        }
        args.push(...tempArgs);
      }
      // For commands with usePrefix: true, require prefix
      if (command.config.usePrefix === true && !body.startsWith(PREFIX)) {
        return;
      }
    }

    if (command && command.config) {
      if (typeof command.config.usePrefix === "undefined") {
        api.sendMessage(
          global.getText("handleCommand", "noPrefix", command.config.name),
          event.threadID,
          event.messageID,
        );
        return;
      }
    }

    if (
      command &&
      command.config &&
      command.config.commandCategory &&
      command.config.commandCategory.toLowerCase() === "nsfw" &&
      !global.data.threadAllowNSFW.includes(threadID) &&
      !ADMINBOT.includes(senderID)
    )
      return api.sendMessage(
        global.getText("handleCommand", "threadNotAllowNSFW"),
        threadID,
        async (_, info) => {
          await new Promise((resolve) => setTimeout(resolve, 5 * 1000));
          return api.unsendMessage(info.messageID);
        },
        messageID,
      );

    var threadInfo2;
    if (event.isGroup == !![])
      try {
        threadInfo2 =
          threadInfo.get(threadID) || (await Threads.getInfo(threadID));
        if (Object.keys(threadInfo2).length == 0) throw new Error();
      } catch (err) {
        logger.log(
          global.getText("handleCommand", "cantGetInfoThread", "error"),
        );
      }

    var permssion = 0;
    var threadInfoo =
      threadInfo.get(threadID) || (await Threads.getInfo(threadID));
    const find = threadInfoo.adminIDs.find((el) => el.id == senderID);
    if (ADMINBOT.includes(senderID.toString())) permssion = 2;
    else if (!ADMINBOT.includes(senderID) && find) permssion = 1;
    if (
      command &&
      command.config &&
      command.config.hasPermssion &&
      command.config.hasPermssion > permssion
    ) {
      return api.sendMessage(
        global.getText(
          "handleCommand",
          "permissionNotEnough",
          command.config.name,
        ),
        event.threadID,
        event.messageID,
      );
    }

    if (
      command &&
      command.config &&
      !client.cooldowns.has(command.config.name)
    ) {
      client.cooldowns.set(command.config.name, new Map());
    }

    const timestamps =
      command && command.config
        ? client.cooldowns.get(command.config.name)
        : undefined;

    const expirationTime =
      ((command && command.config && command.config.cooldowns) || 1) * 1000;

    if (
      timestamps &&
      timestamps instanceof Map &&
      timestamps.has(senderID) &&
      dateNow < timestamps.get(senderID) + expirationTime
    )
      return api.setMessageReaction(
        "⏳",
        event.messageID,
        (err) =>
          err
            ? logger.log(
                "An error occurred while executing setMessageReaction",
                2,
              )
            : "",
        !![],
      );

    var getText2;
    if (
      command &&
      command.languages &&
      typeof command.languages === "object" &&
      command.languages.hasOwnProperty(global.config.language)
    )
      getText2 = (...values) => {
        var lang = command.languages[global.config.language][values[0]] || "";
        for (var i = values.length; i > 0x2533 + 0x1105 + -0x3638; i--) {
          const expReg = RegExp("%" + i, "g");
          lang = lang.replace(expReg, values[i]);
        }
        return lang;
      };
    else getText2 = () => {};

    try {
      const Obj = {
        ...rest,
        ...rest2,
        api: api,
        event: event,
        args: args,
        models: models,
        Users: Users,
        Threads: Threads,
        Currencies: Currencies,
        permssion: permssion,
        getText: getText2,
      };

      if (command && typeof command.run === "function") {
        command.run(Obj);
        timestamps.set(senderID, dateNow);

        // Auto cleanup cache files after command execution
        if (global.cacheManager) {
          global.cacheManager.autoCleanupAfterCommand(commandName, 60); // Cleanup after 1 minute
        }
        return;
      }
    } catch (e) {
      return api.sendMessage(
        global.getText("handleCommand", "commandError", commandName, e),
        threadID,
      );
    }
    activeCmd = false;
  };
};