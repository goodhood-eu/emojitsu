const { spawn } = require('child_process');

const chalk = require('chalk');
const config = require('uni-config');

const utils = {
  formatMessage(payload) {
    if (typeof payload === 'string') return payload;
    let jsonArgs = [payload];
    if (config.debug) jsonArgs = jsonArgs.concat([null, 2]);
    return JSON.stringify(...jsonArgs);
  },

  logSuccess(message) {
    console.log(chalk.bold.green(utils.formatMessage(message)));
    process.exit(0);
  },

  logResult(message) {
    console.log(utils.formatMessage(message));
    process.exit(0);
  },

  logWarning(message) {
    console.error(chalk.yellow(utils.formatMessage(message)));
  },

  logError(message) {
    console.error(chalk.bold.red(utils.formatMessage(message)));
    process.exit(1);
  },

  run(string, options = {}) {
    const [command, ...args] = string.split(' ');

    const executor = (resolve, reject) => {
      let output = '';
      let errors = '';

      const stream = spawn(command, args, options.options);

      const handleData = (chunk) => {
        output += chunk;
        if (!options.silent) process.stdout.write(chunk);
      };

      const handleError = (chunk) => {
        errors += chunk;
        if (!options.silent) process.stderr.write(chunk);
      };

      const handleExit = (exitCode) => {
        const result = { exitCode, output, errors };
        if (exitCode) return reject(result);
        return resolve(result);
      };

      stream.stdout.on('data', handleData);
      stream.stderr.on('data', handleError);
      stream.on('exit', handleExit);
    };

    return new Promise(executor);
  },
};

module.exports = utils;
