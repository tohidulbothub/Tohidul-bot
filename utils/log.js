
const chalk = require("chalk");
const gradient = require("gradient-string");
const con = require("./../config.json");

function getThemeColors() {
  const theme = con.DESIGN.Theme;
  let subcolor, main, error, secondary, tertiary, html;

  switch (theme.toLowerCase()) {
    case "blue":
      main = gradient("#0000ff", "#ffffff", "#000000"); // blue, white, black
      subcolor = gradient("#ff0000", "#00ff00", "#0000ff"); // red, green, blue
      secondary = chalk.hex("#ffffff"); // white
      tertiary = chalk.bold.hex("#0000ff"); // blue
      error = chalk.hex("#ff0000").bold; // red
      html = ["#0000ff", "#ffffff", "#000000"];
      break;
    case "fiery":
      main = gradient("#ff0000", "#ffffff", "#00ff00");
      subcolor = gradient("#ff0000", "#0000ff", "#000000");
      secondary = chalk.hex("#ffffff");
      tertiary = chalk.bold.hex("#ff0000");
      error = chalk.red.bold;
      html = ["#ff0000", "#ffffff", "#00ff00"];
      break;
    case "red":
      main = gradient("#ff0000", "#ffffff", "#000000");
      subcolor = gradient("#ff0000", "#00ff00", "#0000ff");
      secondary = chalk.hex("#ffffff");
      tertiary = chalk.bold.hex("#ff0000");
      error = chalk.red.bold;
      html = ["#ff0000", "#ffffff", "#000000"];
      break;
    case "aqua":
      main = gradient("#0000ff", "#ffffff", "#00ff00");
      subcolor = gradient("#0000ff", "#ff0000", "#ffffff");
      secondary = chalk.hex("#0000ff");
      tertiary = chalk.bold.hex("#00ff00");
      error = chalk.hex("#ff0000");
      html = ["#0000ff", "#ffffff", "#00ff00"];
      break;
    case "pink":
      main = gradient("#ff0000", "#ffffff", "#0000ff");
      subcolor = gradient("#ff0000", "#00ff00", "#000000");
      secondary = chalk.hex("#ffffff");
      tertiary = chalk.bold.hex("#ff0000");
      error = gradient("#ff0000", "#000000");
      html = ["#ff0000", "#ffffff", "#0000ff"];
      break;
    case "retro":
      main = gradient("#ff0000", "#00ff00", "#0000ff");
      subcolor = gradient("#ffffff", "#000000", "#ff0000");
      secondary = chalk.hex("#ffffff");
      tertiary = chalk.bold.hex("#0000ff");
      error = gradient("#ff0000", "#000000");
      html = ["#ff0000", "#00ff00", "#0000ff"];
      break;
    case "sunlight":
      main = gradient("#ffffff", "#00ff00", "#0000ff");
      subcolor = gradient("#ff0000", "#ffffff", "#000000");
      secondary = chalk.hex("#ffffff");
      tertiary = chalk.bold.hex("#00ff00");
      error = gradient("#ff0000", "#000000");
      html = ["#ffffff", "#00ff00", "#0000ff"];
      break;
    case "teen":
      main = gradient("#0000ff", "#ff0000", "#ffffff");
      subcolor = gradient("#00ff00", "#000000", "#0000ff");
      secondary = chalk.hex("#ffffff");
      tertiary = chalk.bold.hex("#ff0000");
      error = gradient("#ff0000", "#000000");
      html = ["#0000ff", "#ff0000", "#ffffff"];
      break;
    case "summer":
      main = gradient("#00ff00", "#ffffff", "#0000ff");
      subcolor = gradient("#ff0000", "#000000", "#00ff00");
      secondary = chalk.hex("#ffffff");
      tertiary = chalk.bold.hex("#00ff00");
      error = gradient("#ff0000", "#000000");
      html = ["#00ff00", "#ffffff", "#0000ff"];
      break;
    case "flower":
      main = gradient("#ffffff", "#ff0000", "#00ff00");
      subcolor = gradient("#0000ff", "#000000", "#ffffff");
      secondary = chalk.hex("#00ff00");
      tertiary = chalk.bold.hex("#ff0000");
      error = gradient("#ff0000", "#000000");
      html = ["#ffffff", "#ff0000", "#00ff00"];
      break;
    case "ghost":
      main = gradient("#000000", "#ffffff", "#0000ff");
      subcolor = gradient("#ff0000", "#00ff00", "#000000");
      secondary = chalk.hex("#ffffff");
      tertiary = chalk.bold.hex("#0000ff");
      error = gradient("#ff0000", "#000000");
      html = ["#000000", "#ffffff", "#0000ff"];
      break;
    case "hacker":
      main = gradient("#00ff00", "#000000", "#ffffff");
      subcolor = gradient("#ff0000", "#0000ff", "#00ff00");
      secondary = chalk.hex("#00ff00");
      tertiary = chalk.bold.hex("#ffffff");
      error = chalk.hex("#ff0000");
      html = ["#00ff00", "#000000", "#ffffff"];
      break;
    case "purple":
      main = gradient("#0000ff", "#ff0000", "#ffffff");
      subcolor = gradient("#000000", "#00ff00", "#0000ff");
      secondary = chalk.hex("#0000ff");
      tertiary = chalk.bold.hex("#ff0000");
      error = chalk.hex("#ff0000");
      html = ["#0000ff", "#ff0000", "#ffffff"];
      break;
    case "rainbow":
      main = gradient("#ff0000", "#00ff00", "#0000ff", "#ffffff", "#000000");
      subcolor = gradient("#0000ff", "#ff0000", "#00ff00", "#ffffff");
      secondary = chalk.hex("#ffffff");
      tertiary = chalk.bold.hex("#ff0000");
      error = chalk.hex("#ff0000");
      html = ["#ff0000", "#00ff00", "#0000ff"];
      break;
    case "orange":
      main = gradient("#ff0000", "#ffffff", "#00ff00");
      subcolor = gradient("#0000ff", "#000000", "#ff0000");
      secondary = chalk.hex("#ffffff");
      tertiary = chalk.bold.hex("#ff0000");
      error = chalk.hex("#ff0000");
      html = ["#ff0000", "#ffffff", "#00ff00"];
      break;
    case "matrix":
    default:
      main = gradient("#00ff00", "#ffffff", "#000000", "#0000ff", "#ff0000");
      subcolor = gradient("#ff0000", "#0000ff", "#ffffff", "#00ff00", "#000000");
      secondary = chalk.hex("#ffffff");
      tertiary = chalk.bold.hex("#00ff00");
      error = chalk.hex("#ff0000");
      html = ["#00ff00", "#ffffff", "#000000"];
      break;
  }
  return { main, subcolor, error, secondary, tertiary, html };
}

function logger(text, type) {
  const colors = getThemeColors();
  switch (type) {
    case "warn":
      process.stderr.write(
        colors.main(`⫸ TBH ➤ `) + colors.error(`[ ERROR ] `) + colors.secondary(text) + "\n",
      );
      break;
    case "error":
      console.log(colors.main(`⫸ TBH ➤ `) + chalk.bold.hex("#ff0000").bold(`[ ERROR ] `) + colors.secondary(text) + "\n");
      break;
    case "load":
      console.log(colors.main(`⫸ TBH ➤ `) + colors.subcolor(`[ NEW USER ] `) + colors.secondary(text) + "\n");
      break;
    default:
      process.stderr.write(
        colors.main(`⫸ TBH ➤ `) + colors.subcolor(`[ ${String(type).toUpperCase()} ] `) +
          colors.secondary(text) +
          "\n",
      );
  }
}

// Store original console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;

// Override console.log to use colorful output with mixed colors
console.log = function() {
  const args = Array.prototype.slice.call(arguments);
  const colors = getThemeColors();
  const timestamp = new Date().toLocaleTimeString();
  
  // Apply mixed red, green, blue, white, black colors to different types of arguments
  const coloredArgs = args.map(arg => {
    if (typeof arg === 'string') {
      // Check if string contains special patterns - using mixed color palette
      if (arg.includes('✓') || arg.includes('SUCCESS')) {
        return gradient('#00ff00', '#ffffff', '#0000ff')(arg);
      } else if (arg.includes('✗') || arg.includes('ERROR') || arg.includes('Failed')) {
        return gradient('#ff0000', '#000000', '#ffffff')(arg);
      } else if (arg.includes('⚠') || arg.includes('WARNING')) {
        return gradient('#ff0000', '#00ff00', '#ffffff')(arg);
      } else if (arg.includes('📊') || arg.includes('INFO')) {
        return gradient('#0000ff', '#ffffff', '#00ff00')(arg);
      } else if (arg.includes('🌐') || arg.includes('WEB')) {
        return gradient('#00ff00', '#0000ff', '#ffffff')(arg);
      } else if (arg.includes('DATABASE')) {
        return gradient('#0000ff', '#ff0000', '#ffffff')(arg);
      } else if (arg.includes('COMMAND') || arg.includes('EVENT')) {
        return gradient('#ff0000', '#00ff00', '#000000')(arg);
      } else {
        return gradient('#ffffff', '#00ff00', '#0000ff', '#ff0000', '#000000')(arg);
      }
    } else if (typeof arg === 'number') {
      return gradient('#0000ff', '#ffffff', '#ff0000')(arg.toString());
    } else if (typeof arg === 'object' && arg !== null) {
      return gradient('#00ff00', '#ffffff', '#000000')(JSON.stringify(arg, null, 2));
    } else if (typeof arg === 'boolean') {
      return arg ? gradient('#00ff00', '#ffffff')(arg) : gradient('#ff0000', '#000000')(arg);
    }
    return gradient('#ffffff', '#0000ff', '#00ff00', '#ff0000', '#000000')(String(arg));
  });
  
  // Don't add timestamp if the message already has TBH prefix
  const hasPrefix = args.some(arg => typeof arg === 'string' && arg.includes('⫸ TBH ➤'));
  
  if (hasPrefix) {
    originalConsoleLog.apply(console, coloredArgs);
  } else {
    const finalArgs = [
      colors.main(`⫸ TBH ➤ `) + 
      colors.subcolor(`[ ${timestamp} ] `)
    ].concat(coloredArgs);
    
    originalConsoleLog.apply(console, finalArgs);
  }
};

// Enhanced console methods with mixed color palette
console.success = function() {
  const args = Array.prototype.slice.call(arguments);
  const timestamp = new Date().toLocaleTimeString();
  originalConsoleLog(
    gradient('#00ff00', '#ffffff', '#0000ff')(`⫸ TBH ➤ `) + 
    gradient('#00ff00', '#ffffff')(`[ ✓ SUCCESS ] `) + 
    gradient('#ffffff', '#00ff00', '#0000ff')(args.join(' '))
  );
};

console.error = function() {
  const args = Array.prototype.slice.call(arguments);
  const timestamp = new Date().toLocaleTimeString();
  originalConsoleError(
    gradient('#ff0000', '#ffffff', '#000000')(`⫸ TBH ➤ `) + 
    gradient('#ff0000', '#000000')(`[ ✗ ERROR ] `) + 
    gradient('#ff0000', '#ffffff', '#000000')(args.join(' '))
  );
};

console.warn = function() {
  const args = Array.prototype.slice.call(arguments);
  const timestamp = new Date().toLocaleTimeString();
  originalConsoleWarn(
    gradient('#ff0000', '#00ff00', '#ffffff')(`⫸ TBH ➤ `) + 
    gradient('#ff0000', '#00ff00')(`[ ⚠ WARNING ] `) + 
    gradient('#ff0000', '#ffffff', '#00ff00')(args.join(' '))
  );
};

console.info = function() {
  const args = Array.prototype.slice.call(arguments);
  const timestamp = new Date().toLocaleTimeString();
  originalConsoleInfo(
    gradient('#0000ff', '#ffffff', '#00ff00')(`⫸ TBH ➤ `) + 
    gradient('#0000ff', '#ffffff')(`[ 📊 INFO ] `) + 
    gradient('#ffffff', '#0000ff', '#00ff00')(args.join(' '))
  );
};

console.debug = function() {
  const args = Array.prototype.slice.call(arguments);
  const timestamp = new Date().toLocaleTimeString();
  originalConsoleLog(
    gradient('#000000', '#ffffff', '#0000ff')(`⫸ TBH ➤ `) + 
    gradient('#000000', '#ffffff')(`[ 🔍 DEBUG ] `) + 
    gradient('#ffffff', '#000000', '#0000ff')(args.join(' '))
  );
};

// Special themed console methods with mixed color palette
console.loading = function() {
  const args = Array.prototype.slice.call(arguments);
  originalConsoleLog(
    gradient('#0000ff', '#ff0000', '#ffffff')(`⫸ TBH ➤ `) + 
    gradient('#00ff00', '#0000ff', '#ffffff')(`[ 🔄 LOADING ] `) + 
    gradient('#ffffff', '#00ff00', '#ff0000')(args.join(' '))
  );
};

console.ready = function() {
  const args = Array.prototype.slice.call(arguments);
  originalConsoleLog(
    gradient('#00ff00', '#ffffff', '#0000ff')(`⫸ TBH ➤ `) + 
    gradient('#00ff00', '#ffffff', '#ff0000')(`[ 🚀 READY ] `) + 
    gradient('#ffffff', '#00ff00', '#0000ff')(args.join(' '))
  );
};

console.system = function() {
  const args = Array.prototype.slice.call(arguments);
  originalConsoleLog(
    gradient('#000000', '#ffffff', '#ff0000')(`⫸ TBH ➤ `) + 
    gradient('#0000ff', '#ffffff', '#00ff00')(`[ 🔧 SYSTEM ] `) + 
    gradient('#ffffff', '#000000', '#0000ff')(args.join(' '))
  );
};

console.database = function() {
  const args = Array.prototype.slice.call(arguments);
  originalConsoleLog(
    gradient('#0000ff', '#ff0000', '#ffffff')(`⫸ TBH ➤ `) + 
    gradient('#00ff00', '#0000ff', '#ffffff')(`[ 💾 DATABASE ] `) + 
    gradient('#ffffff', '#0000ff', '#00ff00')(args.join(' '))
  );
};

console.web = function() {
  const args = Array.prototype.slice.call(arguments);
  originalConsoleLog(
    gradient('#00ff00', '#0000ff', '#ffffff')(`⫸ TBH ➤ `) + 
    gradient('#0000ff', '#ffffff', '#ff0000')(`[ 🌐 WEB ] `) + 
    gradient('#ffffff', '#00ff00', '#0000ff')(args.join(' '))
  );
};

console.command = function() {
  const args = Array.prototype.slice.call(arguments);
  originalConsoleLog(
    gradient('#ff0000', '#00ff00', '#ffffff')(`⫸ TBH ➤ `) + 
    gradient('#00ff00', '#0000ff', '#ffffff')(`[ ⚡ COMMAND ] `) + 
    gradient('#ffffff', '#ff0000', '#00ff00')(args.join(' '))
  );
};

console.event = function() {
  const args = Array.prototype.slice.call(arguments);
  originalConsoleLog(
    gradient('#0000ff', '#ffffff', '#ff0000')(`⫸ TBH ➤ `) + 
    gradient('#ff0000', '#00ff00', '#ffffff')(`[ 🎯 EVENT ] `) + 
    gradient('#ffffff', '#0000ff', '#ff0000')(args.join(' '))
  );
};

module.exports = logger;
module.exports.getThemeColors = getThemeColors;
module.exports.log = logger;
module.exports.error = (text, type) => {
  const colors = getThemeColors();
  process.stderr.write(colors.main(`⫸ TBH ➤ `) + chalk.hex("#ff0000")(`[ ${type} ] `) + colors.secondary(text) + "\n");
};
module.exports.err = (text, type) => {
  const colors = getThemeColors();
  process.stderr.write(
    colors.main(`⫸ TBH ➤ `) + colors.subcolor(`[ ${type} ] `) + colors.secondary(text) + "\n",
  );
};
module.exports.warn = (text, type) => {
  const colors = getThemeColors();
  process.stderr.write(
    colors.main(`⫸ TBH ➤ `) + colors.subcolor(`[ ${type} ] `) + colors.secondary(text) + "\n",
  );
};
module.exports.loader = (data, option) => {
  const colors = getThemeColors();
  switch (option) {
    case "warn":
      process.stderr.write(
        colors.main(`⫸ TBH ➤ `) + colors.subcolor(`[ SYSTEM ]`) + colors.secondary(data) + "\n",
      );
      break;
    case "error":
      process.stderr.write(
        colors.main(`⫸ TBH ➤ `) + chalk.hex("#ff0000")(`[ SYSTEM ] `) + colors.error(data) + "\n",
      );
      break;
    default:
      console.log(colors.main(`⫸ TBH ➤ `) + colors.subcolor(`[ SYSTEM ] `) + colors.secondary(data));
      break;
  }
};

// Mixed color logging utilities
module.exports.rainbow = (text) => {
  return gradient('#ff0000', '#00ff00', '#0000ff', '#ffffff', '#000000')(text);
};

module.exports.colorize = {
  success: (text) => gradient('#00ff00', '#ffffff', '#0000ff')(text),
  error: (text) => gradient('#ff0000', '#000000', '#ffffff')(text),
  warning: (text) => gradient('#ff0000', '#00ff00', '#ffffff')(text),
  info: (text) => gradient('#0000ff', '#ffffff', '#00ff00')(text),
  debug: (text) => gradient('#000000', '#ffffff', '#0000ff')(text),
  highlight: (text) => gradient('#ffffff', '#ff0000', '#00ff00')(text),
  accent: (text) => gradient('#0000ff', '#ffffff', '#ff0000')(text),
  secondary: (text) => gradient('#00ff00', '#000000', '#ffffff')(text),
  tertiary: (text) => gradient('#ff0000', '#0000ff', '#ffffff')(text),
  mixed: (text) => gradient('#ff0000', '#00ff00', '#0000ff', '#ffffff', '#000000')(text)
};

// Themed console output with mixed colors
module.exports.themed = {
  log: (text, type = 'INFO') => {
    const colors = getThemeColors();
    console.log(
      colors.main(`⫸ TBH ➤ `) +
      colors.subcolor(`[ ${type.toUpperCase()} ] `) +
      colors.secondary(text)
    );
  },
  
  box: (text, title = 'TOHI-BOT-HUB') => {
    const colors = getThemeColors();
    const boxWidth = Math.max(text.length, title.length) + 4;
    const border = '═'.repeat(boxWidth);
    
    console.log(gradient('#ff0000', '#00ff00', '#0000ff')(`╔${border}╗`));
    console.log(gradient('#ff0000', '#00ff00', '#0000ff')(`║ `) + gradient('#ffffff', '#0000ff', '#ff0000')(title.padEnd(boxWidth - 2)) + gradient('#ff0000', '#00ff00', '#0000ff')(` ║`));
    console.log(gradient('#ff0000', '#00ff00', '#0000ff')(`╠${border}╣`));
    console.log(gradient('#ff0000', '#00ff00', '#0000ff')(`║ `) + gradient('#ffffff', '#00ff00', '#000000')(text.padEnd(boxWidth - 2)) + gradient('#ff0000', '#00ff00', '#0000ff')(` ║`));
    console.log(gradient('#ff0000', '#00ff00', '#0000ff')(`╚${border}╝`));
  },
  
  banner: (text) => {
    const bannerWidth = text.length + 8;
    const stars = '★'.repeat(bannerWidth);
    
    console.log(gradient('#ff0000', '#00ff00', '#0000ff', '#ffffff', '#000000')(stars));
    console.log(gradient('#ff0000', '#00ff00', '#0000ff')('★★  ') + gradient('#ffffff', '#0000ff', '#ff0000')(text) + gradient('#ff0000', '#00ff00', '#0000ff')('  ★★'));
    console.log(gradient('#ff0000', '#00ff00', '#0000ff', '#ffffff', '#000000')(stars));
  },

  gradient: (text, style = 'mixed') => {
    switch(style) {
      case 'mixed': return gradient('#ff0000', '#00ff00', '#0000ff', '#ffffff', '#000000')(text);
      case 'rgb': return gradient('#ff0000', '#00ff00', '#0000ff')(text);
      case 'mono': return gradient('#ffffff', '#000000')(text);
      case 'fire': return gradient('#ff0000', '#ffffff', '#000000')(text);
      case 'ocean': return gradient('#0000ff', '#ffffff', '#00ff00')(text);
      case 'nature': return gradient('#00ff00', '#ffffff', '#000000')(text);
      default: return gradient('#ff0000', '#00ff00', '#0000ff', '#ffffff', '#000000')(text);
    }
  }
};

// Mixed color matrix rain effect
module.exports.matrixRain = () => {
  const chars = '01 ';
  let rain = '';
  for(let i = 0; i < 50; i++) {
    rain += chars[Math.floor(Math.random() * chars.length)];
  }
  console.log(gradient('#ff0000', '#00ff00', '#0000ff', '#ffffff', '#000000')(rain));
};

// Initialize colorful console on module load
console.log(gradient('#ff0000', '#00ff00', '#0000ff', '#ffffff', '#000000')('🎨 TOHI-BOT-HUB Mixed Color Console System Initialized! 🎨'));
