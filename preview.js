const express = require('express');

const { codePointToUnicode } = require('./lib/conversions');
const { shortnameToUnicode, unicodeToShortname } = require('./lib/utils');
const { render: renderEmoji } = require('./lib');
const { getVersion } = require('./tasks/utils/unicode');
const { getUnicodeSpec } = require('./tasks/utils/data');
const { collection } = require('./vendor/emojis.json');

const PORT = 3000;
const app = express();
const renderOptions = { cdn: '/images', className: 'emoji' };
const previewSize = 20;

const renderHTML = (content) => `
  <!DOCTYPE html>
  <html lang="en" dir="ltr">
    <head>
      <meta charset="utf-8">
      <title>Emoji preview</title>
      <style>
        html {
          font-size: ${previewSize}px;
        }
        nav {
          margin: 60px auto;
          text-align: center;
        }
        nav a {
          margin: 10px;
          padding: 10px;
          display: block;
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
      ${content}
    </body>
  </html>
`;


const renderList = (list) => (
  list.map(([title, items]) => `
    <article>
      <h2>${title}</h2>
      <p>${items.join(' ')}</p>
    </article>
  `).join('\n')
);

const renderSuggestables = () => {
  const filtered = collection.filter(({ suggest }) => suggest);
  const unicodeList = filtered.map(({ shortname }) => shortnameToUnicode(shortname));
  const imagesList = filtered.map(({ hex }) => (
    renderEmoji(codePointToUnicode(hex), renderOptions)
  ));

  const sections = [
    ['Unicode output', unicodeList],
    ['Unicode conversion', imagesList],
  ];

  return renderHTML(renderList(sections));
};

const renderCollection = () => {
  const unicodeList = collection.map(({ shortname }) => shortnameToUnicode(shortname));
  const imagesList = collection.map(({ hex }) => (
    renderEmoji(codePointToUnicode(hex), renderOptions)
  ));

  const sections = [
    ['Unicode output', unicodeList],
    ['Unicode conversion', imagesList],
  ];

  return renderHTML(renderList(sections));
};

const handleSpec = async(req, res) => {
  const spec = await getUnicodeSpec(getVersion());

  const specUnicode = spec.map(({ unicode }) => unicode);
  const specUnicodeImages = specUnicode.map((unicode) => renderEmoji(unicode, renderOptions));
  const specCodePointsImages = spec.map(({ codePoint }) => (
    renderEmoji(codePointToUnicode(codePoint), renderOptions)
  ));
  const shortnamesImages = specUnicode
    .map(unicodeToShortname)
    .map(shortnameToUnicode)
    .map((unicode) => renderEmoji(unicode, renderOptions));

  const sections = [
    ['Unicode output', specUnicode],
    ['Unicode conversion', specUnicodeImages],
    ['Codepoints conversion', specCodePointsImages],
    ['Shortnames conversion', shortnamesImages],
  ];

  const html = renderHTML(renderList(sections));
  res.send(html);
};

const pages = `
  <nav>
    <a href="/suggestable">Suggestables</a>
    <a href="/collection">Collection</a>
    <a href="/spec">Spec</a>
  </nav>
`;

app.get('/', (req, res) => res.send(renderHTML(pages)));

app.get('/suggestable', (req, res) => res.send(renderSuggestables()));
app.get('/collection', (req, res) => res.send(renderCollection()));
app.get('/spec', handleSpec);

app.use('/images', express.static('node_modules/emojione-assets/png/128'));
app.get('*', (req, res) => res.status(404).send('Page doesn\'t exist'));
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}!`));
