const pkg = require('../../package');

const version = pkg.devDependencies['emoji-assets'].replace(/\^/g, '');

const utils = {
  getVersion() {
    return version;
  },
};

module.exports = utils;
