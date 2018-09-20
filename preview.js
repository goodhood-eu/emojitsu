const express = require('express');
const request = require('request');

const { shortnameToUnicode, codePointToUnicode } = require('./lib/utils');
const { render: renderEmoji } = require('./lib');
const { getUnicodeSpecUrl, parseUnicodeSpec, logError } = require('./tasks/utils');
const { collection } = require('./vendor/emojis.json');

const PORT = 3000;
const URL = getUnicodeSpecUrl();
const app = express();
const renderOptions = { cdn: '/images', className: 'emoji' };
const previewSize = 20;

const render = (spec) => {
  const unicodeList = collection.map(({ shortname }) => shortnameToUnicode(shortname));
  const imagesList = collection.map(({ hex }) => (
    renderEmoji(codePointToUnicode(hex), renderOptions)
  ));

  const specUnicode = spec.map((item) => item[2]);
  const specUnicodeImages = specUnicode.map((unicode) => renderEmoji(unicode, renderOptions));
  const specCodePointsImages = spec.map((item) => (
    renderEmoji(codePointToUnicode(item[1].replace(/\s/g, '-')), renderOptions)
  ));

  const sections = [
    ['Unicode output test', unicodeList],
    ['Unicode conversion test', imagesList],
    ['Spec unicode test', specUnicode],
    ['Spec conversion test', specUnicodeImages],
    ['Spec codepoints conversion test', specCodePointsImages],
  ];

  return `
  <!DOCTYPE html>
  <html lang="en" dir="ltr">
    <head>
      <meta charset="utf-8">
      <title>Emoji preview</title>
      <style>
        html {
          font-size: ${previewSize}px;
        }
        article {
          margin-top: 60px;
        }
        .emoji {
          width: ${previewSize}px;
        }
      </style>
    </head>
    <body>
      ${sections.map(([title, list]) => `
        <article>
          <h2>${title}</h2>
          <p>${list.join(' ')}</p>
        </article>
      `).join('\n')}
    </body>
  </html>
  `;
};

const handleSpecReady = (error, response, body) => {
  if (error || response.statusCode !== 200) return logError(`Cound't load spec data (${URL}): ${error}`);
  console.log(`Loaded unicode spec from ${URL}`);

  const html = render(parseUnicodeSpec(body));

  app.get('/', (req, res) => res.send(html));
  app.use('/images', express.static('node_modules/emojione-assets/png/128'));
  app.get('*', (req, res) => res.status(404).send('Page doesn\'t exist'));
  app.listen(PORT, () => console.log(`Server is listening on port ${PORT}!`));
};

request(URL, handleSpecReady);
