const fs = require('fs');
const path = require('path');
const emojis = require('emojione-assets/emoji');
const { logResult } = require('./utils');
const pkg = require('../package');

const version = pkg.devDependencies['emojione-assets'].replace(/\^/g, '');
const DEFAULT_FILENAME = `raw-emoji-${version}.json`;
const content = JSON.stringify(emojis, null, 2);

const process = (fileName = DEFAULT_FILENAME) => {
  const target = path.resolve(`${__dirname}/../${fileName}`);
  fs.writeFileSync(target, content);
  logResult(`Saved results to: ${target}`);
};

module.exports = process;
