const fs = require('fs');
const path = require('path');
const { unicodeToCodePoint } = require('../lib/conversions');
const { unicodeToEmoji } = require('../lib/utils');

const { logSuccess, logError } = require('./utils/log');
const { render, emojiRegex } = require('../lib');

const renderedRegex = /<img src="[/\w.-]+"\salt="\S+"\sdraggable="false"\s\/>/g;

const UTF16toJSON = (text) => {
  const result = [];

  for (let i = 0; i < text.length; i += 1) {
    const padded = `000${text.charCodeAt(i).toString(16)}`.slice(-4);
    result.push(`\\u${padded}`);
  }

  return result.join('');
};

const showSequences = (string) => `(${UTF16toJSON(string)}) [${unicodeToCodePoint(string)}]`;

const processEmojis = (list) => {
  const errors = [];

  list.forEach((unicode) => {
    const regex = new RegExp(emojiRegex, 'g');

    // Check regex matcher first
    if (!regex.test(unicode)) {
      const error = `Regex error: expected to match '${unicode}' ${showSequences(unicode)}`;
      return errors.push(error);
    }

    // Check if matching against our dict works correctly
    const emojiData = unicodeToEmoji(unicode);
    if (!emojiData) {
      const error = `Detection error: got no data for '${unicode}' ${showSequences(unicode)}`;
      return errors.push(error);
    }

    const rendered = render(unicode);
    const images = rendered.match(/<img/g);

    if (!images || images.length > 1) {
      const error = `Render error: got wrong image '${rendered}' rendering '${unicode}' ${showSequences(unicode)}`;
      return errors.push(error);
    }

    // Check string for garbage
    const stripped = rendered.replace(renderedRegex, '');
    if (stripped.length !== 0) {
      const error = `Render error: got garbage ${showSequences(stripped)} rendering '${unicode}' ${showSequences(unicode)}`;
      return errors.push(error);
    }
  });

  if (errors.length) return logError(`Processing failed:\n${errors.join('\n')}`);
};

const run = async(type = 'ios') => {
  const file = path.resolve(`${__dirname}/../scaffolding/emojis_${type}.txt`);
  const raw = fs.readFileSync(file, 'utf8');
  const spec = raw.split(/\s+/).map((string) => string.trim()).filter((item) => item.length);

  console.log(`Running ${type} tests`);
  processEmojis(spec);
  logSuccess(`${spec.length} ${type} emoji matched OK`);
};

module.exports = run;
