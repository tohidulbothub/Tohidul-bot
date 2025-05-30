
// This command has been removedg 24/7!`;
        break;

      case 'stats':
        const startTime = global.client?.timeStart || Date.now();
        const runTime = Date.now() - startTime;
        const runDays = Math.floor(runTime / (1000 * 60 * 60 * 24));
        const runHours = Math.floor((runTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        message = `📈 Keep-Alive Statistics\n\n` +
                 `🚀 Bot Runtime: ${runDays}d ${runHours}h\n` +
                 `💬 Commands Loaded: ${global.client?.commands?.size || 0}\n` +
                 `🎯 Events Loaded: ${global.client?.events?.size || 0}\n` +
                 `🔧 Node.js Version: ${process.version}\n` +
                 `💻 Platform: ${process.platform}\n` +
                 `📡 Keep-Alive URL: http://0.0.0.0:3000/ping\n\n` +
                 `🌟 System is stable and running!`;
        break;

      case 'restart':
        message = `🔄 Restarting keep-alive services...\n\n` +
                 `Please wait while the bot reinitializes its services.`;
        
        api.sendMessage(message, threadID, messageID);
        
        // Restart the process
        setTimeout(() => {
          process.exit(1);
        }, 2000);
        return;

      default:
        message = `❓ Keep-Alive Commands:\n\n` +
                 `• keepalive status - Show server status\n` +
                 `• keepalive stats - Show detailed statistics\n` +
                 `• keepalive restart - Restart bot services\n\n` +
                 `🌐 Web Interface: http://0.0.0.0:3000`;
    }

    api.sendMessage(message, threadID, messageID);

  } catch (error) {
    console.error('Keep-alive command error:', error);
    api.sendMessage('❌ Error checking keep-alive status.', event.threadID, event.messageID);
  }
};
