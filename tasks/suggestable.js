const { logResult } = require('./utils');
const { codePointToUnicode } = require('../lib/utils');

const process = (style) => {
  const { collection } = require('../vendor/emojis');
  const suggested = collection.reduce((acc, { hex, shortname, suggest }) => {
    if (suggest) acc.push(`${shortname} ${codePointToUnicode(hex)}`);
    return acc;
  }, []);

  suggested.sort();

  let result;
  if (style === 'inline') {
    const shortnames = suggested.map((item) => item.split(/\s/)[0]).join('');
    const unicode = suggested.map((item) => item.split(/\s/)[1]).join('');
    result = `Suggesting:\n${shortnames}\n${unicode}\nTotal: ${suggested.length}`;
  } else {
    result = `Suggesting:\n${suggested.join('\n')}\nTotal: ${suggested.length}`;
  }

  logResult(result);
};

module.exports = process;
