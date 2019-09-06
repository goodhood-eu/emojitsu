/* eslint no-bitwise: "off" */
const fs = require('fs');
const path = require('path');
const { Trie } = require('regexgen');
const uniq = require('lodash.uniq');
const { logResult, logError } = require('./utils/log');
const { getUnicodeSpec } = require('./utils/files');
const { hexToId, fromCodePoint } = require('../lib/utils');

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

const sortByLength = (a, b) => b.length - a.length;

const isSuggestable = (hash, key) => {
  const { shortname, display, diversity, category, unicode_version } = hash[key];

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

const getEmojiData = (spec, assets) => spec.reduce((acc, item) => {
  const { codePoint, unicode, qualified } = item;
  const key = hexToId(codePoint);

  if (!assets[key]) {
    logError(`Coundn't find ${key} in the assets data`);
    return acc;
  }

  if (!acc[key]) {
    const { shortname, display, diversity, category, unicode_version } = assets[key];
    acc[key] = { shortname, display, diversity, category, unicode_version, codePoints: [] };
  }

  acc[key].codePoints.push({ unicode, qualified, hex: codePoint });

  return acc;
}, {});

const getCollection = (hash) => {
  const keys = Object.keys(hash);

  keys.sort((keyA, keyB) => hash[keyA].order - hash[keyB].order);

  return keys.reduce((acc, key) => {
    const { category, shortname, codePoints } = hash[key];

    const { hex } = codePoints.find(({ qualified }) => qualified === 'fully-qualified');
    const suggest = isSuggestable(hash, key);

    acc.push({ category, hex, shortname, suggest });

    return acc;
  }, []);
};

const getRegex = (hash) => {
  const keys = Object.keys(hash);

  const codes = keys.reduce((acc, key) => {
    const codePoints = hash[key].codePoints.map(({ hex }) => hex);
    const filtered = uniq(codePoints);
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

const runTask = async() => {
  const specArray = await getUnicodeSpec();
  const processedHash = getEmojiData(specArray, require('emojione-assets/emoji'));

  const collection = getCollection(processedHash);
  const emojiRegex = getRegex(processedHash);

  const shortnameRegex = '(:[\\w-]+:)';
  const total = collection.length;

  const json = { collection, emojiRegex, shortnameRegex, total };
  const content = `${JSON.stringify(json, null, 2)}\n`;
  fs.writeFileSync(OUTPUT, content);

  return logResult(`Created ${total} entries, results saved to ${OUTPUT}`);
};

module.exports = runTask;
