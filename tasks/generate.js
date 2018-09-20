/* eslint no-bitwise: "off" */
const fs = require('fs');
const path = require('path');
const { Trie } = require('regexgen');
const emojis = require('emojione-assets/emoji');
const uniq = require('lodash.uniq');
const { logResult } = require('./utils');

// Maximum unicode version to show in suggestions
const SUPPORTED_UNICODE_VERSION = 10;

// These are not to be shown in the suggestions because they are nonsense
const SKIPPED_CATEGORIES = [
  'flags',
  'modifier',
  'extras',
  'regional',
];

const OUTPUT = path.resolve(`${__dirname}/../vendor/emojis.json`);

const familyRegex = /^:family_/;
const clockRegex = /^:clock/;
const shapeRegex = /_(diamond|square|triangle|circle|sign):$/;

const patchEmojioneSource = (object) => {
  // EmojiOne decided to match these even when they are plain text, patch codepoints to fix that
  ['0023', '0039', '0038', '0037', '0036', '0035', '0034', '0033', '0032', '0031', '0030', '002a'].forEach((key) => {
    const item = object[key].code_points;
    const correct = item.fully_qualified;
    item.non_fully_qualified = correct;
    item.default_matches = [correct];
  });
};

const getKeys = () => Object.keys(emojis);
const sortByLength = (a, b) => b.length - a.length;

const isSuggestable = (key) => {
  const { shortname, display, diversity, category, unicode_version } = emojis[key];

  const isDisplayable = Boolean(display);
  const isOptional = Boolean(diversity);
  const isSkipped = SKIPPED_CATEGORIES.includes(category);
  const isDesirable = [
    familyRegex,
    clockRegex,
    shapeRegex,
  ].every((regex) => !regex.test(shortname));

  const isSupported = SUPPORTED_UNICODE_VERSION >= unicode_version;

  return isDisplayable && !isOptional && !isSkipped && isDesirable && isSupported;
};

const getCollection = () => {
  const keys = getKeys();

  keys.sort();

  return keys.reduce((acc, key) => {
    const { category, shortname, code_points } = emojis[key];

    // FIXME: REMOVE THIS LINE
    // if (emojis[key].unicode_version === 11) return acc

    const hex = code_points.output;
    const suggest = isSuggestable(key);

    acc.push({ category, hex, shortname, suggest });

    return acc;
  }, []);
};

const getRegex = () => {
  const keys = getKeys();

  const fromCodePoint = (codepoint) => {
    const code = parseInt(codepoint, 16);
    if (code < 0x10000) return String.fromCharCode(code);

    const base = code - 0x10000;
    return String.fromCharCode(0xD800 + (base >> 10), 0xDC00 + (base & 0x3FF));
  };

  const sequences = keys.reduce((acc, key) => {
    const {
      output,
      fully_qualified,
      non_fully_qualified,
      default_matches,
    } = emojis[key].code_points;

    // FIXME: REMOVE THIS LINE
    // if (emojis[key].unicode_version === 11) return acc

    const matchable = [output, fully_qualified, non_fully_qualified].concat(default_matches);
    const codePointArray = uniq(matchable);

    // Sorting to improve matching
    codePointArray.sort(sortByLength);
    const codes = codePointArray.map((hex) => hex.split('-').map(fromCodePoint).join(''));

    return acc.concat(codes);
  }, []);

  // Sorting again so longer emojis go first
  sequences.sort(sortByLength);

  const trie = new Trie();
  trie.addAll(sequences);

  return `(${trie.toString()})`;
};

const runTask = () => {
  patchEmojioneSource(emojis);
  const collection = getCollection();
  const emojiRegex = getRegex();
  const shortnameRegex = '(:[\\w-]+:)';
  const total = collection.length;

  const json = { collection, emojiRegex, shortnameRegex, total };
  const content = `${JSON.stringify(json, null, 2)}\n`;
  fs.writeFileSync(OUTPUT, content);

  return logResult(`Created ${total} entries, results saved to ${OUTPUT}`);
};

module.exports = runTask;
