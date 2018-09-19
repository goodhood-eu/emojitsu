const chalk = require('chalk');

const emoji = /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/ug;
const parseRegex = /^((?:[A-Z0-9]+\s)+)\s*;\s[\w-]+\s+#\s(\S+)\s([\s\S]+)$/;
const commentRegex = /^#/;

const DEFAULT_EMOJI_VERSION = '5.0';

const utils = {
  formatMessage(payload) {
    if (typeof payload === 'string') return payload;
    return JSON.stringify(payload, null, 2);
  },

  getUnicodeSpecUrl(string) {
    const version = /\d+\.\d+/.test(string) ? string : DEFAULT_EMOJI_VERSION;
    return `http://unicode.org/Public/emoji/${version}/emoji-test.txt`;
  },

  parseUnicodeSpec(data) {
    const errors = [];
    const chunks = data.split('\n').reduce((acc, string) => {
      // Check if it's a correct parsable line
      if (!string.length || commentRegex.test(string)) return acc;
      const matches = string.match(parseRegex);
      if (!matches) errors.push(string);
      if (matches) acc.push(matches.map((substr) => substr.trim()));
      return acc;
    }, []);

    if (errors.length) return utils.logError(`Spec parser failed:\n${errors.join('\n')}`);

    return chunks;
  },

  logSuccess(message) {
    console.log(chalk.bold.green(utils.formatMessage(message)));
    process.exit(0);
  },

  logResult(message) {
    console.log(utils.formatMessage(message));
    process.exit(0);
  },

  logError(message) {
    console.error(chalk.bold.red(utils.formatMessage(message)));
    process.exit(1);
  },
};

module.exports = utils;
