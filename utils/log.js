
const chalk = require("chalk");
const gradient = require("gradient-string");
const con = require("./../config.json");

function getThemeColors() {
  const theme = con.DESIGN.Theme;
  let subcolor, main, error, secondary, tertiary, html;

  switch (theme.toLowerCase()) {
    case "blue":
      main = gradient("yellow", "lime", "green"); // cra
      subcolor = gradient("#243aff", "#4687f0", "#5800d4"); // co
      secondary = chalk.blueBright; // cb
      tertiary = chalk.bold.hex("#3467eb"); // cv
      error = chalk.hex("#ff0000").bold;
      html = ["#1702CF", "#11019F ", "#1401BF"];
      break;
    case "fiery":
      main = gradient("orange", "orange", "yellow");
      subcolor = gradient("#fc2803", "#fc6f03", "#fcba03");
      secondary = chalk.hex("#fff308");
      tertiary = chalk.bold.hex("#fc3205");
      error = chalk.red.bold;
      html = ["#CE2F16", "#fe8916", "#ff952a"];
      break;
    case "red":
      main = gradient("yellow", "lime", "green");
      subcolor = gradient("red", "orange");
      secondary = chalk.hex("#ff0000");
      tertiary = chalk.bold.hex("#ff0000");
      error = chalk.red.bold;
      html = ["#ff0000", "#ff4747", "#ff0026"];
      break;
    case "aqua":
      main = gradient("#6883f7", "#8b9ff7", "#b1bffc");
      subcolor = gradient("#0030ff", "#4e6cf2");
      secondary = chalk.hex("#3056ff");
      tertiary = chalk.bold.hex("#0332ff");
      error = chalk.blueBright;
      html = ["#2e5fff", "#466deb", "#1BD4F5"];
      break;
    case "pink":
      main = gradient("purple", "pink");
      subcolor = gradient("#d94fff", "purple");
      secondary = chalk.hex("#6a00e3");
      tertiary = chalk.bold.hex("#6a00e3");
      error = gradient("purple", "pink");
      html = ["#ab68ed", "#ea3ef0", "#c93ef0"];
      break;
    case "retro":
      main = gradient("orange", "purple");
      subcolor = gradient.retro;
      secondary = chalk.hex("#ffce63");
      tertiary = chalk.bold.hex("#3c09ab");
      error = gradient("#d94fff", "purple");
      html = ["#7d02bf", "#FF6F6F", "#E67701"];
      break;
    case "sunlight":
      main = gradient("#f5bd31", "#f5e131");
      subcolor = gradient("orange", "#ffff00", "#ffe600");
      secondary = chalk.hex("#faf2ac");
      tertiary = chalk.bold.hex("#ffe600");
      error = gradient("#f5bd31", "#f5e131");
      html = ["#ffae00", "#ffbf00", "#ffdd00"];
      break;
    case "teen":
      main = gradient("#81fcf8", "#853858");
      subcolor = gradient.teen;
      secondary = chalk.hex("#a1d5f7");
      tertiary = chalk.bold.hex("#ad0042");
      error = gradient("#00a9c7", "#853858");
      html = ["#29D5FB", "#9CFBEF", "#fa7f7f"];
      break;
    case "summer":
      main = gradient("#fcff4d", "#4de1ff");
      subcolor = gradient.summer;
      secondary = chalk.hex("#ffff00");
      tertiary = chalk.bold.hex("#fff700");
      error = gradient("#fcff4d", "#4de1ff");
      html = ["#f7f565", "#16FAE3", "#16D1FA"];
      break;
    case "flower":
      main = gradient("yellow", "yellow", "#81ff6e");
      subcolor = gradient.pastel;
      secondary = gradient("#47ff00", "#47ff75");
      tertiary = chalk.bold.hex("#47ffbc");
      error = gradient("blue", "purple", "yellow", "#81ff6e");
      html = ["#16B6FA", "#FB7248", "#13FF9C"];
      break;
    case "ghost":
      main = gradient("#0a658a", "#0a7f8a", "#0db5aa");
      subcolor = gradient.mind;
      secondary = chalk.blueBright;
      tertiary = chalk.bold.hex("#1390f0");
      error = gradient("#0a658a", "#0a7f8a", "#0db5aa");
      html = ["#076889", "#0798C7", "#95d0de"];
      break;
    case "hacker":
      main = chalk.hex("#4be813");
      subcolor = gradient("#47a127", "#0eed19", "#27f231");
      secondary = chalk.hex("#22f013");
      tertiary = chalk.bold.hex("#0eed19");
      error = chalk.hex("#4be813");
      html = ["#049504", "#0eed19", "#01D101"];
      break;
    case "purple":
      main = chalk.hex("#7a039e");
      subcolor = gradient("#243aff", "#4687f0", "#5800d4");
      secondary = chalk.hex("#6033f2");
      tertiary = chalk.bold.hex("#5109eb");
      error = chalk.hex("#7a039e");
      html = ["#380478", "#5800d4", "#4687f0"];
      break;
    case "rainbow":
      main = chalk.hex("#0cb3eb");
      subcolor = gradient.rainbow;
      secondary = chalk.hex("#ff3908");
      tertiary = chalk.bold.hex("#f708ff");
      error = chalk.hex("#ff8400");
      html = ["#E203B2", "#06DBF7", "#F70606"];
      break;
    case "orange":
      main = chalk.hex("#ff8400");
      subcolor = gradient("#ff8c08", "#ffad08", "#f5bb47");
      secondary = chalk.hex("#ebc249");
      tertiary = chalk.bold.hex("#ff8c08");
      error = chalk.hex("#ff8400");
      html = ["#ff8c08", "#ffad08", "#f5bb47"];
      break;
    case "matrix":
    default:
      main = gradient("#00ff00", "#39ff39", "#00cc00");
      subcolor = gradient("#00ff41", "#39ff14", "#ccff00");
      secondary = chalk.hex("#00ff00");
      tertiary = chalk.bold.hex("#39ff14");
      error = chalk.hex("#ff0041");
      html = ["#00ff00", "#39ff14", "#ccff00"];
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

// Override console.log to use colorful output
console.log = function() {
  const args = Array.prototype.slice.call(arguments);
  const colors = getThemeColors();
  const timestamp = new Date().toLocaleTimeString();
  
  // Apply green gradient colors to different types of arguments
  const coloredArgs = args.map(arg => {
    if (typeof arg === 'string') {
      // Check if string contains special patterns - all in green gradients
      if (arg.includes('✓') || arg.includes('SUCCESS')) {
        return gradient('#00ff00', '#39ff39')(arg);
      } else if (arg.includes('✗') || arg.includes('ERROR') || arg.includes('Failed')) {
        return gradient('#ff4141', '#00ff41')(arg);
      } else if (arg.includes('⚠') || arg.includes('WARNING')) {
        return gradient('#ccff00', '#39ff14')(arg);
      } else if (arg.includes('📊') || arg.includes('INFO')) {
        return gradient('#00ff41', '#39ff14')(arg);
      } else if (arg.includes('🌐') || arg.includes('WEB')) {
        return gradient('#00cc00', '#39ff39')(arg);
      } else if (arg.includes('DATABASE')) {
        return gradient('#00ff00', '#ccff00')(arg);
      } else if (arg.includes('COMMAND') || arg.includes('EVENT')) {
        return gradient('#39ff14', '#00ff41')(arg);
      } else {
        return gradient('#00ff00', '#39ff39', '#00cc00')(arg);
      }
    } else if (typeof arg === 'number') {
      return gradient('#39ff14', '#ccff00')(arg.toString());
    } else if (typeof arg === 'object' && arg !== null) {
      return gradient('#00ff00', '#39ff39')(JSON.stringify(arg, null, 2));
    } else if (typeof arg === 'boolean') {
      return arg ? gradient('#00ff00', '#39ff39')(arg) : gradient('#ff4141', '#00ff41')(arg);
    }
    return gradient('#00ff00', '#39ff39', '#00cc00')(String(arg));
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

// Enhanced console methods with green gradient colors
console.success = function() {
  const args = Array.prototype.slice.call(arguments);
  const timestamp = new Date().toLocaleTimeString();
  originalConsoleLog(
    gradient('#00ff00', '#39ff39')(`⫸ TBH ➤ `) + 
    gradient('#00ff00', '#39ff39')(`[ ✓ SUCCESS ] `) + 
    gradient('#00cc00', '#ccff00')(args.join(' '))
  );
};

console.error = function() {
  const args = Array.prototype.slice.call(arguments);
  const timestamp = new Date().toLocaleTimeString();
  originalConsoleError(
    gradient('#00ff00', '#39ff39')(`⫸ TBH ➤ `) + 
    gradient('#ff4141', '#00ff41')(`[ ✗ ERROR ] `) + 
    gradient('#ff4141', '#00ff41')(args.join(' '))
  );
};

console.warn = function() {
  const args = Array.prototype.slice.call(arguments);
  const timestamp = new Date().toLocaleTimeString();
  originalConsoleWarn(
    gradient('#00ff00', '#39ff39')(`⫸ TBH ➤ `) + 
    gradient('#ccff00', '#39ff14')(`[ ⚠ WARNING ] `) + 
    gradient('#ccff00', '#39ff14')(args.join(' '))
  );
};

console.info = function() {
  const args = Array.prototype.slice.call(arguments);
  const timestamp = new Date().toLocaleTimeString();
  originalConsoleInfo(
    gradient('#00ff00', '#39ff39')(`⫸ TBH ➤ `) + 
    gradient('#00ff41', '#39ff14')(`[ 📊 INFO ] `) + 
    gradient('#00ff41', '#39ff14')(args.join(' '))
  );
};

console.debug = function() {
  const args = Array.prototype.slice.call(arguments);
  const timestamp = new Date().toLocaleTimeString();
  originalConsoleLog(
    gradient('#00ff00', '#39ff39')(`⫸ TBH ➤ `) + 
    gradient('#39ff14', '#ccff00')(`[ 🔍 DEBUG ] `) + 
    gradient('#39ff14', '#ccff00')(args.join(' '))
  );
};

// Special themed console methods with green gradients
console.loading = function() {
  const args = Array.prototype.slice.call(arguments);
  originalConsoleLog(
    gradient('#00ff00', '#39ff39')(`⫸ TBH ➤ `) + 
    gradient('#39ff14', '#ccff00')(`[ 🔄 LOADING ] `) + 
    gradient('#00cc00', '#39ff39')(args.join(' '))
  );
};

console.ready = function() {
  const args = Array.prototype.slice.call(arguments);
  originalConsoleLog(
    gradient('#00ff00', '#39ff39')(`⫸ TBH ➤ `) + 
    gradient('#00ff00', '#39ff39')(`[ 🚀 READY ] `) + 
    gradient('#39ff14', '#ccff00')(args.join(' '))
  );
};

console.system = function() {
  const args = Array.prototype.slice.call(arguments);
  originalConsoleLog(
    gradient('#00ff00', '#39ff39')(`⫸ TBH ➤ `) + 
    gradient('#39ff14', '#ccff00')(`[ 🔧 SYSTEM ] `) + 
    gradient('#00cc00', '#39ff39')(args.join(' '))
  );
};

console.database = function() {
  const args = Array.prototype.slice.call(arguments);
  originalConsoleLog(
    gradient('#00ff00', '#39ff39')(`⫸ TBH ➤ `) + 
    gradient('#00ff00', '#ccff00')(`[ 💾 DATABASE ] `) + 
    gradient('#00cc00', '#39ff39')(args.join(' '))
  );
};

console.web = function() {
  const args = Array.prototype.slice.call(arguments);
  originalConsoleLog(
    gradient('#00ff00', '#39ff39')(`⫸ TBH ➤ `) + 
    gradient('#00cc00', '#39ff39')(`[ 🌐 WEB ] `) + 
    gradient('#00cc00', '#39ff39')(args.join(' '))
  );
};

console.command = function() {
  const args = Array.prototype.slice.call(arguments);
  originalConsoleLog(
    gradient('#00ff00', '#39ff39')(`⫸ TBH ➤ `) + 
    gradient('#39ff14', '#00ff41')(`[ ⚡ COMMAND ] `) + 
    gradient('#00cc00', '#39ff39')(args.join(' '))
  );
};

console.event = function() {
  const args = Array.prototype.slice.call(arguments);
  originalConsoleLog(
    gradient('#00ff00', '#39ff39')(`⫸ TBH ➤ `) + 
    gradient('#39ff14', '#00ff41')(`[ 🎯 EVENT ] `) + 
    gradient('#00cc00', '#39ff39')(args.join(' '))
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

// Additional green gradient logging utilities
module.exports.rainbow = (text) => {
  return gradient('#00ff00', '#39ff39', '#ccff00', '#00ff41', '#39ff14')(text);
};

module.exports.colorize = {
  success: (text) => gradient('#00ff00', '#39ff39')(text),
  error: (text) => gradient('#ff4141', '#00ff41')(text),
  warning: (text) => gradient('#ccff00', '#39ff14')(text),
  info: (text) => gradient('#00ff41', '#39ff14')(text),
  debug: (text) => gradient('#39ff14', '#ccff00')(text),
  highlight: (text) => gradient('#00ff00', '#39ff39')(text),
  accent: (text) => gradient('#39ff14', '#00ff41')(text),
  secondary: (text) => gradient('#00cc00', '#39ff39')(text),
  tertiary: (text) => gradient('#39ff14', '#ccff00')(text)
};

// Themed console output
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
    
    console.log(colors.main(`╔${border}╗`));
    console.log(colors.main(`║ `) + colors.subcolor(title.padEnd(boxWidth - 2)) + colors.main(` ║`));
    console.log(colors.main(`╠${border}╣`));
    console.log(colors.main(`║ `) + colors.secondary(text.padEnd(boxWidth - 2)) + colors.main(` ║`));
    console.log(colors.main(`╚${border}╝`));
  },
  
  banner: (text) => {
    const colors = getThemeColors();
    const bannerWidth = text.length + 8;
    const stars = '★'.repeat(bannerWidth);
    
    console.log(colors.main(stars));
    console.log(colors.main('★★  ') + colors.subcolor(text) + colors.main('  ★★'));
    console.log(colors.main(stars));
  },

  gradient: (text, style = 'rainbow') => {
    switch(style) {
      case 'rainbow': return gradient.rainbow(text);
      case 'passion': return gradient.passion(text);
      case 'fruit': return gradient.fruit(text);
      case 'mind': return gradient.mind(text);
      case 'morning': return gradient.morning(text);
      case 'vice': return gradient.vice(text);
      case 'atlas': return gradient.atlas(text);
      case 'cristal': return gradient.cristal(text);
      case 'teen': return gradient.teen(text);
      case 'summer': return gradient.summer(text);
      case 'pastel': return gradient.pastel(text);
      case 'retro': return gradient.retro(text);
      default: return getThemeColors().main(text);
    }
  }
};

// Matrix rain effect for matrix theme
module.exports.matrixRain = () => {
  const colors = getThemeColors();
  const chars = '01 ';
  let rain = '';
  for(let i = 0; i < 50; i++) {
    rain += chars[Math.floor(Math.random() * chars.length)];
  }
  console.log(colors.main(rain));
};

// Initialize colorful console on module load
console.log(gradient.rainbow('🎨 TOHI-BOT-HUB Colorful Console System Initialized! 🎨'));
