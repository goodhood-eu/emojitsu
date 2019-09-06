const { assert } = require('chai');

const {
  codepointsHash,
  shortnamesHash,

  unicodeToEmoji,
  shortnameToEmoji,
  shortnameToUnicode,
  unicodeToShortname,

  sanitize,
  getOptions,
  getImageSrc,

  hexToImage,
} = require('../lib/utils');

const { emoji, tone, mixed, specialSpacer, specialEnder, arrow } = require('../scaffolding/emojis');


describe('utils', () => {
  it('codepointsHash', () => {
    assert.isObject(codepointsHash, 'correct data type');
    assert.isObject(codepointsHash[emoji.hex], 'data integrity ok');
  });

  it('shortnamesHash', () => {
    assert.isObject(shortnamesHash, 'correct data type');
    assert.isObject(shortnamesHash[emoji.shortname], 'data integrity ok');
  });

  it('unicodeToEmoji', () => {
    assert.isObject(unicodeToEmoji(emoji.unicode), 'simple emoji');
    assert.isObject(unicodeToEmoji(tone.unicode), 'toned emoji');
    assert.isObject(unicodeToEmoji(mixed.unicode), 'wwb emoji');
    assert.isObject(unicodeToEmoji(specialSpacer.unicode), 'emoji with 200d');
    assert.isObject(unicodeToEmoji(specialEnder.unicode), 'emoji with fe0f');
    assert.isObject(unicodeToEmoji(arrow.unicode), 'emoji with fe0f ending missing');
  });

  it('shortnameToEmoji', () => {
    assert.isObject(shortnameToEmoji(emoji.shortname), 'simple emoji');
    assert.isObject(shortnameToEmoji(tone.shortname), 'toned emoji');
    assert.isObject(shortnameToEmoji(mixed.shortname), 'wwb emoji');
    assert.isObject(shortnameToEmoji(specialSpacer.shortname), 'emoji with 200d');
    assert.isObject(shortnameToEmoji(specialEnder.shortname), 'emoji with fe0f');
  });

  it('shortnameToUnicode', () => {
    assert.equal(shortnameToUnicode(emoji.shortname), emoji.unicode, 'simple emoji');
    assert.equal(shortnameToUnicode(tone.shortname), tone.unicode, 'toned emoji');
    assert.equal(shortnameToUnicode(mixed.shortname), mixed.unicode, 'wwb emoji');
    assert.equal(shortnameToUnicode(specialSpacer.shortname), specialSpacer.unicode, 'emoji with 200d');
    assert.equal(shortnameToUnicode(specialEnder.shortname), specialEnder.unicode, 'emoji with fe0f');
  });

  it('unicodeToShortname', () => {
    assert.equal(unicodeToShortname(emoji.unicode), emoji.shortname, 'simple emoji');
    assert.equal(unicodeToShortname(tone.unicode), tone.shortname, 'toned emoji');
    assert.equal(unicodeToShortname(mixed.unicode), mixed.shortname, 'wwb emoji');
    assert.equal(unicodeToShortname(specialSpacer.unicode), specialSpacer.shortname, 'emoji with 200d');
    assert.equal(unicodeToShortname(specialEnder.unicode), specialEnder.shortname, 'emoji with fe0f');
  });

  it('sanitize', () => {
    assert.equal(sanitize('<script>'), '&lt;script&gt;', 'defaults');
    assert.equal(sanitize('<script>', { unsafe: true }), '<script>', 'not escaped');
  });

  it('getOptions', () => {
    assert.isObject(getOptions(), '&lt;script&gt;', 'returns correct data type');
    assert.equal(getOptions({ className: 'topkek' }).className, 'topkek', 'overrides work');
    assert.isNumber(getOptions().size, 'has sane defaults');
  });

  it('getImageSrc', () => {
    assert.include(getImageSrc(emoji.icon), `${emoji.icon}.png`, 'simple emoji');
    assert.include(getImageSrc(emoji.icon, 128), `/128/${emoji.icon}.png`, 'can set size');
    assert.include(getImageSrc(emoji.icon, 999999), `/64/${emoji.icon}.png`, 'only whitelisted sizes work');
    assert.include(getImageSrc(emoji.icon, 'http://maxcdn.com/1024'), `http://maxcdn.com/1024/${emoji.icon}.png`, 'setting CDN works');
  });

  it('hexToImage', () => {
    assert.include(hexToImage(emoji.hex), emoji.icon, 'renders correct emoji');
    assert.include(hexToImage(specialEnder.hex), specialEnder.icon, 'renders correct specialEnder');
    assert.include(hexToImage(specialEnder.hex, { className: 'topkek' }), 'class="topkek"', 'options work');
    assert.match(hexToImage(emoji.hex), /^<img/, 'correct tag');
  });
});
