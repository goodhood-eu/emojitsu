const { logResult } = require('./utils');
const { codePointToUnicode } = require('../lib/utils');

const process = (style) => {
  const { collection } = require('../vendor/emojis');
  const suggested = collection.reduce((acc, { hex, shortname, suggest }) => {
    if (suggest) acc.push([shortname, codePointToUnicode(hex)]);
    return acc;
  }, []);

  suggested.sort();

  let result;
  if (style === 'inline') {
    const shortnames = suggested.map((item) => item[0]).join(' ');
    const unicode = suggested.map((item) => item[1]).join(' ');
    result = `Suggesting:\n${shortnames}\n${unicode}\nTotal: ${suggested.length}`;
  } else {
    const items = suggested.map((item) => item.join(' ')).join('\n');
    result = `Suggesting:\n${items}\nTotal: ${suggested.length}`;
  }

  logResult(result);
};

module.exports = process;
