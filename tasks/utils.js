const chalk = require('chalk');

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
