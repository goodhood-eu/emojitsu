const express = require('express');
const request = require('request');

const { shortnameToUnicode, codePointToUnicode } = require('./lib/utils');
const { render } = require('./lib');
const { getUnicodeSpecUrl, parseUnicodeSpec, logError } = require('./tasks/utils');
const { collection } = require('./vendor/emojis.json');

const PORT = 3000;
const URL = getUnicodeSpecUrl();
const app = express();
const renderOptions = { cdn: '/images', className: 'emoji' };
const previewSize = 20;

const handleSpecReady = (error, response, body) => {
  if (error || response.statusCode !== 200) return logError(`Cound't load spec data: ${error}`);
  console.log(`Loaded unicode spec from ${URL}`);

  const parsedSpec = parseUnicodeSpec(body);

  const unicodeList = collection.map(({ shortname }) => shortnameToUnicode(shortname));
  const imagesList = collection.map(({ hex }) => render(codePointToUnicode(hex), renderOptions));

  const specUnicode = parsedSpec.map((item) => item[2]);
  const specUnicodeImages = specUnicode.map((unicode) => render(unicode, renderOptions));
  const specCodePointsImages = parsedSpec.map((item) => (
    render(codePointToUnicode(item[1].replace(/\s/g, '-')), renderOptions)
  ));

  const sections = [
    ['Shortcodes to unicode', unicodeList],
    ['Unicode to images', imagesList],
    ['Spec unicode', specUnicode],
    ['Spec unicode to images', specUnicodeImages],
    ['Spec codepoints to images', specCodePointsImages],
  ];

  const text = `
  <!DOCTYPE html>
  <html lang="en" dir="ltr">
    <head>
      <meta charset="utf-8">
      <title>Emoji preview</title>
      <style>
        html {
          font-size: ${previewSize}px;
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

  app.get('/', (req, res) => res.send(text));
  app.use('/images', express.static('node_modules/emojione-assets/png/128'));
  app.get('*', (req, res) => res.send('404'));
  app.listen(PORT, () => console.log(`Server is listening on port ${PORT}!`));
};

request(URL, handleSpecReady);
