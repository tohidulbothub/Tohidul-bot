const logger = require('./utils/log');
const cron = require('node-cron');

module.exports = async ({ api }) => {
  const minInterval = 5;
  let lastMessageTime = 0;
  let messagedThreads = new Set();

  const config = {
    autoRestart: {
      status: false, // Completely disabled
      time: 60,
      note: 'Auto restart is disabled to prevent auto-off issues',
    },
    acceptPending: {
      status: false, // Completely disabled
      time: 30,
      note: 'Auto accept is disabled to prevent issues',
    },
  };

  // DO NOT enable any auto functions
  // autoRestart(config.autoRestart);
  // acceptPending(config.acceptPending);

  console.log('Custom.js loaded - Auto functions are disabled');
};