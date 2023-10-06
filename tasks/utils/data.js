const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const got = require('got');

const { logError } = require('./log');
const { parseUnicodeSpec } = require('./unicode');

const OUTPUT = path.resolve(`${__dirname}/../../build`);

mkdirp.sync(OUTPUT);

const parseAndSave = (file, data) => {
  const parsedData = parseUnicodeSpec(data);
  fs.writeFileSync(file, JSON.stringify(parsedData, null, 2));
  return parsedData;
};

const utils = {
  getUnicodeSpec: async(version) => {
    const parsedFile = `${OUTPUT}/unicode-${version}.json`;
    const rawFile = `${OUTPUT}/unicode-${version}.txt`;
    const url = `https://unicode.org/Public/emoji/${version}/emoji-test.txt`;

    if (fs.existsSync(parsedFile)) return JSON.parse(fs.readFileSync(parsedFile, 'utf8'));
    if (fs.existsSync(rawFile)) return parseAndSave(parsedFile, fs.readFileSync(rawFile, 'utf8'));

    try {
      console.log(`Fetching data from ${url} and saving locally`);
      const { body } = await got(url);
      fs.writeFileSync(rawFile, body);
      return parseAndSave(parsedFile, body);
    } catch (error) {
      logError(`Wasn't able to fetch unicode data for url: ${url}, error: ${error}`);
    }
  },
};

module.exports = utils;
