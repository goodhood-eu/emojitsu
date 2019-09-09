const fs = require('fs');
const path = require('path');
const emojis = require('emoji-assets/emoji');
const { logResult } = require('./utils/log');
const { getVersion } = require('./utils/assets');

const DEFAULT_FILENAME = `raw-emoji-${getVersion()}.json`;
const content = JSON.stringify(emojis, null, 2);

const process = (fileName = DEFAULT_FILENAME) => {
  const target = path.resolve(`${__dirname}/../${fileName}`);
  fs.writeFileSync(target, content);
  logResult(`Saved results to: ${target}`);
};

module.exports = process;
