const pkg = require('../../package');

const version = pkg.devDependencies['emojione-assets'].replace(/\^/g, '');

const utils = {
  getVersion() {
    return version;
  },
};

module.exports = utils;
