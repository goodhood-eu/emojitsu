/* eslint no-bitwise: "off" */
const request = require('request');

const { logSuccess, logError } = require('./utils');
const { codePointToUnicode, unicodeToEmoji } = require('../lib/utils');
const { render, emojiRegex } = require('../lib');

const DEFAULT_EMOJI_VERSION = '5.0';

const parseRegex = /^((?:[A-Z0-9]+\s)+)\s*;\s[\w-]+\s+#\s(\S+)\s([\s\S]+)$/;
const commentRegex = /^#/;
const renderedRegex = /<img src="[/\w.-]+"\salt="\S+"\sdraggable="false"\s\/>/g;

const formatVersion = (string) => {
  if (!/\d+\.\d+/.test(string)) return DEFAULT_EMOJI_VERSION;
  return string;
};

const formatCodePoint = (string) => string.replace(/\s/g, '-');

const UTF16toJSON = (text) => {
  const result = [];

  for (let i = 0; i < text.length; i += 1) {
    const padded = `000${text.charCodeAt(i).toString(16)}`.slice(-4);
    result.push(`\\u${padded}`);
  }

  return result.join('');
};

const processEmojis = (list) => {
  const errors = [];

  list.forEach((item) => {
    const [codePoint, unicode, name] = item.slice(1);

    const regex = new RegExp(emojiRegex, 'g');

    // Check regex matcher first
    if (!regex.test(unicode)) {
      const error = `Regex error: expected to match '${unicode}' ('${UTF16toJSON(unicode)}') near '${name}'`;
      return errors.push(error);
    }

    // Check encoder
    const encoded = codePointToUnicode(formatCodePoint(codePoint));
    if (encoded !== unicode) {
      const error = `Encoder error: expected '${unicode}' ('${UTF16toJSON(unicode)}') but got '${encoded}' ('${UTF16toJSON(encoded)}') near '${name}'`;
      return errors.push(error);
    }

    // Check if matching against our dict works correctly
    const emojiData = unicodeToEmoji(unicode);
    if (!emojiData) {
      const error = `Detection error: got no data for '${unicode}' ('${UTF16toJSON(unicode)}') near '${name}'`;
      return errors.push(error);
    }

    const rendered = render(unicode);

    const images = rendered.match(/<img/g);

    if (!images || images.length > 1) {
      const error = `Render error: got wrong image '${rendered}' rendering '${unicode}' ('${UTF16toJSON(unicode)}') near '${name}'`;
      return errors.push(error);
    }

    // Check string for garbage
    const stripped = rendered.replace(renderedRegex, '');
    if (stripped.length !== 0) {
      const error = `Render error: got garbage '${UTF16toJSON(stripped)}' rendering '${unicode}' ('${UTF16toJSON(unicode)}') near '${name}'`;
      return errors.push(error);
    }
  });

  if (errors.length) return logError(`Processing failed:\n${errors.join('\n')}`);
};

const parseList = (data) => {
  const errors = [];
  const chunks = data.split('\n').reduce((acc, string) => {
    // Check if it's a correct parsable line
    if (!string.length || commentRegex.test(string)) return acc;
    const matches = string.match(parseRegex);
    if (!matches) errors.push(string);
    if (matches) acc.push(matches.map((substr) => substr.trim()));
    return acc;
  }, []);

  if (errors.length) return logError(`Parser failed:\n${errors.join('\n')}`);

  return chunks;
};


const process = (version) => {
  const url = `http://unicode.org/Public/emoji/${formatVersion(version)}/emoji-test.txt`;

  const handleRequest = (error, response, body) => {
    if (error || response.statusCode !== 200) {
      return logError(`Cound't load test data: ${error}`);
    }
    const parsed = parseList(body);
    processEmojis(parsed);
    logSuccess(`${parsed.length} emoji matched OK`);
  };

  request(url, handleRequest);
};

module.exports = process;
