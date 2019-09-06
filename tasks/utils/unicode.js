const { logError } = require('./log');
const { CURRENT_UNICODE_VERSION } = require('./constants');

const parseRegex = /^((?:[A-Z0-9]+\s)+)\s*;\s([\w-]+)\s+#\s(\S+)\s([\s\S]+)$/;
const commentRegex = /^#/;

const utils = {
  getVersion(string) {
    return /\d+\.\d+/.test(string) ? string : `${CURRENT_UNICODE_VERSION}.0`;
  },
  parseUnicodeSpec(data) {
    const errors = [];
    const chunks = data.split('\n').reduce((acc, string) => {
      // Check if it's a correct parsable line
      if (!string.length || commentRegex.test(string)) return acc;
      const matches = string.match(parseRegex);
      if (!matches) errors.push(string);
      const [line, rawCodePoint, qualified, unicode, name] = matches.map((substr) => substr.trim());
      const codePoint = rawCodePoint.replace(/\s/g, '-').toLowerCase();
      acc.push({ line, codePoint, qualified, unicode, name });
      return acc;
    }, []);

    if (errors.length) return logError(`Spec parser failed:\n${errors.join('\n')}`);

    return chunks;
  },
};

module.exports = utils;
