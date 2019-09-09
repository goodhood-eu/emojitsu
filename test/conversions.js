const { assert } = require('chai');

const {
  unicodeToCodePoint,
  fromCodePoint,
  codePointToUnicode,
  hexToId,
} = require('../lib/conversions');

const { emoji, tone, mixed, specialSpacer, specialEnder } = require('../scaffolding/emojis');

describe('utils', () => {
  it('unicodeToCodePoint', () => {
    assert.equal(unicodeToCodePoint(emoji.unicode), emoji.hex, 'simple emoji');
    assert.equal(unicodeToCodePoint(tone.unicode), tone.hex, 'toned emoji');
    assert.equal(unicodeToCodePoint(mixed.unicode), mixed.hex, 'wwb emoji');
    assert.equal(unicodeToCodePoint(specialSpacer.unicode), specialSpacer.hex, 'emoji with 200d');
    assert.equal(unicodeToCodePoint(specialEnder.unicode), specialEnder.hex, 'emoji with fe0f');

    assert.equal(unicodeToCodePoint('©'), '00a9', 'zero padded correctly');
  });

  it('fromCodePoint', () => {
    assert.equal(fromCodePoint(emoji.hex), emoji.unicode, 'simple emoji');
  });

  it('codePointToUnicode', () => {
    assert.equal(codePointToUnicode(emoji.hex), emoji.unicode, 'simple emoji');
    assert.equal(codePointToUnicode(tone.hex), tone.unicode, 'toned emoji');
    assert.equal(codePointToUnicode(mixed.hex), mixed.unicode, 'wwb emoji');
    assert.equal(codePointToUnicode(specialSpacer.hex), specialSpacer.unicode, 'emoji with 200d');
    assert.equal(codePointToUnicode(specialEnder.hex), specialEnder.unicode, 'emoji with fe0f');
  });

  it('hexToId', () => {
    assert.equal(hexToId(emoji.hex), emoji.icon, 'simple emoji');
    assert.equal(hexToId(tone.hex), tone.icon, 'toned emoji');
    assert.equal(hexToId(mixed.hex), mixed.icon, 'wwb emoji');
    assert.equal(hexToId(specialSpacer.hex), specialSpacer.icon, 'emoji with 200d');
    assert.equal(hexToId(specialEnder.hex), specialEnder.icon, 'emoji with fe0f');
  });
});
