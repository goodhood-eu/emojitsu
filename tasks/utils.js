const chalk = require('chalk');

const utils = {
  formatMessage(payload) {
    if (typeof payload === 'string') return payload;
    return JSON.stringify(payload, null, 2);
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
