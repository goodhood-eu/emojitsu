/* eslint no-bitwise: "off" */
const request = require('request');

const { getUnicodeSpecUrl, parseUnicodeSpec, logSuccess, logError } = require('./utils/log');
const { codePointToUnicode, unicodeToCodePoint, unicodeToEmoji } = require('../lib/utils');
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

  list.forEach((item) => {
    const { codePoint, unicode, name, qualified } = item;
    const id = `${name} ${qualified}`;

    const regex = new RegExp(emojiRegex, 'g');

    // Check regex matcher first
    if (!regex.test(unicode)) {
      const error = `Regex error: expected to match '${unicode}' ${showSequences(unicode)} near '${id}'`;
      return errors.push(error);
    }

    // Check encoder
    const encoded = codePointToUnicode(codePoint);
    if (encoded !== unicode) {
      const error = `Encoder error: expected '${unicode}' ${showSequences(unicode)} but got '${encoded}' ${showSequences(encoded)} near '${id}'`;
      return errors.push(error);
    }

    // Check decoder
    const decoded = unicodeToCodePoint(unicode);
    if (decoded !== codePoint) {
      const error = `Decoder error: expected '${codePoint}' ('${unicode}') but got '${decoded}' ('${codePointToUnicode(decoded)}') near '${id}'`;
      return errors.push(error);
    }

    // Check if matching against our dict works correctly
    const emojiData = unicodeToEmoji(unicode);
    if (!emojiData) {
      const error = `Detection error: got no data for '${unicode}' ${showSequences(unicode)} near '${id}'`;
      return errors.push(error);
    }

    const rendered = render(unicode);

    const images = rendered.match(/<img/g);

    if (!images || images.length > 1) {
      const error = `Render error: got wrong image '${rendered}' rendering '${unicode}' ${showSequences(unicode)} near '${id}'`;
      return errors.push(error);
    }

    // Check string for garbage
    const stripped = rendered.replace(renderedRegex, '');
    if (stripped.length !== 0) {
      const error = `Render error: got garbage ${showSequences(stripped)} rendering '${unicode}' ${showSequences(unicode)} near '${id}'`;
      return errors.push(error);
    }
  });

  if (errors.length) return logError(`Processing failed:\n${errors.join('\n')}`);
};

const process = (version) => {
  const url = getUnicodeSpecUrl(version);

  const handleRequest = (error, response, body) => {
    if (error || response.statusCode !== 200) return logError(`Cound't load test data: ${error}`);
    console.log('Running tests');
    const parsed = parseUnicodeSpec(body);
    processEmojis(parsed);
    logSuccess(`${parsed.length} emoji matched OK`);
  };

  console.log(`Requesting data from ${url}`);
  request(url, handleRequest);
};

module.exports = process;
