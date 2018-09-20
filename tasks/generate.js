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
  // EmojiOne™ decided to break these by removing correct `fully-qualified` sequence
  // Patching needed to avoid matching numbers and # * characters
  [
    '0023', '002a', '0030', '0031', '0032', '0033', '0034', '0035', '0036', '0037', '0038', '0039',
  ].forEach((key) => {
    const item = object[key].code_points;
    const correct = `${key}-fe0f`;
    item.output = correct;
    item.fully_qualified = correct;
    item.non_fully_qualified = correct;
    item.default_matches = [correct];
  });

  // EmojiOne™ decided to break these by removing correct `fully-qualified` sequence
  // Patching needed to avoid sending incorrect characters to the server and to match proper emojis
  [
    '00a9', '00ae', '1f170', '1f171', '1f17e', '1f17f', '1f202', '1f237', '203c', '2049', '2122',
    '2139', '2194', '2195', '2196', '2197', '2198', '2199', '21a9', '21aa', '23cf', '24c2', '25aa',
    '25ab', '25b6', '25c0', '25fb', '25fc', '2600', '2601', '2602', '2603', '260e', '2611', '262f',
    '263a', '2640', '2642', '2660', '2663', '2665', '2666', '2668', '267b', '267e', '2695', '26a0',
    '2702', '2708', '2709', '270f', '2712', '2714', '2716', '271d', '2721', '2733', '2734', '2744',
    '2747', '2763', '2764', '27a1', '2934', '2935', '2b05', '2b06', '2b07', '3030', '303d', '3297',
    '3299',
  ].forEach((key) => {
    const item = object[key].code_points;
    const correct = `${key}-fe0f`;
    item.output = correct;
    item.fully_qualified = correct;
    item.non_fully_qualified = key;
    item.default_matches = [key, correct];
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

  keys.sort((keyA, keyB) => emojis[keyA].order - emojis[keyB].order);

  return keys.reduce((acc, key) => {
    const { category, shortname, code_points } = emojis[key];

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

  const codes = keys.reduce((acc, key) => {
    const {
      output,
      fully_qualified,
      non_fully_qualified,
      default_matches,
    } = emojis[key].code_points;

    const matchable = [output, fully_qualified, non_fully_qualified].concat(default_matches);
    const filtered = uniq(matchable);

    return acc.concat(filtered);
  }, []);

  // Sort by length (longest first) to avoid partial matches
  codes.sort(sortByLength);

  // Important to sort before converting, JS engine can't sort unicode sequences properly
  const sequences = codes.map((hex) => hex.split('-').map(fromCodePoint).join(''));

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
