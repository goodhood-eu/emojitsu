const escapeHtml = require('escape-html');
const { assert } = require('chai');

const {
  isSingleEmoji,
  shortnamesToUnicode,
  unicodeToShortnames,

  renderShortname,
  render,

  emojiCollection,
  emojiRegex,
  shortnameRegex,
} = require('../lib');

const { emoji, tone, mixed, specialSpacer, specialEnder } = require('../scaffolding/emojis');


describe('emojitsu', () => {
  it('isSingleEmoji', () => {
    const singleEmoji = ':banana:';
    const singleUnicode = '🤷🏻‍♂️';
    const singleLetter = 'x';
    const singleEmojiWithSpace = '    :penis:   ';
    const randomMessage = 'you my good Sir are a :penis:';
    const randomMessage2 = 'you my good Sir are a 💩';

    assert.isFalse(isSingleEmoji(), 'handles empty arguments');
    assert.isFalse(isSingleEmoji(''), 'handles empty string');
    assert.isTrue(isSingleEmoji(singleEmoji), 'detects single emoji');
    assert.isTrue(isSingleEmoji(singleUnicode), 'detects single unicode emoji');
    assert.isTrue(isSingleEmoji(singleEmojiWithSpace), 'detects malformed single emoiji');
    assert.isFalse(isSingleEmoji(singleLetter), 'single letter');
    assert.isFalse(isSingleEmoji(randomMessage), 'doesn\'t report false positives');
    assert.isFalse(isSingleEmoji(randomMessage2), 'doesn\'t report false positives');
  });

  it('shortnamesToUnicode', () => {
    const long1 = [
      specialEnder.shortname,
      specialSpacer.shortname,
      mixed.shortname,
      tone.shortname,
      emoji.shortname,
    ].join('');

    const long2 = `is ${specialSpacer.shortname}${specialEnder.shortname} good ${tone.shortname} k`;

    const expected1 = [
      specialEnder.unicode,
      specialSpacer.unicode,
      mixed.unicode,
      tone.unicode,
      emoji.unicode,
    ].join('');

    const expected2 = `is ${specialSpacer.unicode}${specialEnder.unicode} good ${tone.unicode} k`;

    const missing = ':topkek:';

    assert.equal(shortnamesToUnicode(), null, 'no arguments');
    assert.equal(shortnamesToUnicode(null), null, 'null');
    assert.equal(shortnamesToUnicode(''), '', 'empty string');

    assert.equal(shortnamesToUnicode(missing), missing, 'doesn\'t touch unknown input');
    assert.equal(shortnamesToUnicode(emoji.shortname), emoji.unicode, 'returns correct data');
    assert.equal(shortnamesToUnicode(tone.shortname), tone.unicode, 'returns correct data toned');
    assert.equal(shortnamesToUnicode(mixed.shortname), mixed.unicode, 'returns correct data mixed');
    assert.equal(shortnamesToUnicode(specialSpacer.shortname), specialSpacer.unicode, 'returns correct data 200d');
    assert.equal(shortnamesToUnicode(specialEnder.shortname), specialEnder.unicode, 'returns correct data fe0f');

    assert.equal(shortnamesToUnicode(long1), expected1, 'long string no spaces');
    assert.equal(shortnamesToUnicode(long2), expected2, 'long string mixed with spaces');
  });

  it('unicodeToShortnames', () => {
    const long1 = [
      specialEnder.unicode,
      specialSpacer.unicode,
      mixed.unicode,
      tone.unicode,
      emoji.unicode,
    ].join('');

    const long2 = `is ${specialSpacer.unicode}${specialEnder.unicode} good ${tone.unicode} k`;

    const expected1 = [
      specialEnder.shortname,
      specialSpacer.shortname,
      mixed.shortname,
      tone.shortname,
      emoji.shortname,
    ].join('');

    const expected2 = `is ${specialSpacer.shortname}${specialEnder.shortname} good ${tone.shortname} k`;

    const missing = '€';

    assert.equal(unicodeToShortnames(), null, 'no arguments');
    assert.equal(unicodeToShortnames(null), null, 'null');
    assert.equal(unicodeToShortnames(''), '', 'empty string');

    assert.equal(unicodeToShortnames(missing), missing, 'doesn\'t touch unknown input');
    assert.equal(unicodeToShortnames(emoji.unicode), emoji.shortname, 'returns correct data');
    assert.equal(unicodeToShortnames(tone.unicode), tone.shortname, 'returns correct data toned');
    assert.equal(unicodeToShortnames(mixed.unicode), mixed.shortname, 'returns correct data mixed');
    assert.equal(unicodeToShortnames(specialSpacer.unicode), specialSpacer.shortname, 'returns correct data 200d');
    assert.equal(unicodeToShortnames(specialEnder.unicode), specialEnder.shortname, 'returns correct data fe0f');

    assert.equal(unicodeToShortnames(long1), expected1, 'long string no spaces');
    assert.equal(unicodeToShortnames(long2), expected2, 'long string mixed with spaces');
  });

  it('renderShortname', () => {
    const expectedEmoji = '<img src="/images/emojis-v4.0.0/64/1f953.png" alt="🥓" draggable="false" />';
    const expectedToned = '<img src="/images/emojis-v4.0.0/64/1f44d-1f3ff.png" alt="👍🏿" draggable="false" />';
    const expectedMixed = '<img src="/images/emojis-v4.0.0/64/1f469-1f469-1f466.png" alt="👩‍👩‍👦" draggable="false" />';
    const expectedSpecialSpacer = '<img src="/images/emojis-v4.0.0/64/1f469-1f3fd-1f680.png" alt="👩🏽‍🚀" draggable="false" />';
    const expectedSpecialEnder = '<img src="/images/emojis-v4.0.0/64/1f468-1f3ff-2708.png" alt="👨🏿‍✈️" draggable="false" />';

    const shortnameMix = [
      specialEnder.shortname,
      specialSpacer.shortname,
      mixed.shortname,
      tone.shortname,
      emoji.shortname,
    ].join('');

    const textShortnameMix = `is ${specialSpacer.shortname}${specialEnder.shortname} good ${tone.shortname} k`;

    const expectedMix = [
      expectedSpecialEnder,
      expectedSpecialSpacer,
      expectedMixed,
      expectedToned,
      expectedEmoji,
    ].join('');
    const expectedTextMix = `is ${expectedSpecialSpacer}${expectedSpecialEnder} good ${expectedToned} k`;

    const HTML = `<span>${specialEnder.shortname}</span>`;
    const escapedHTML = escapeHtml('<span>xxx</span>').replace('xxx', expectedSpecialEnder);
    const unescapedHTML = `<span>${expectedSpecialEnder}</span>`;
    const className = 'MY_UNIQUE_CLASS_NAME_FOR_SURE_THERE';

    assert.equal(renderShortname(), null, 'no arguments');
    assert.equal(renderShortname(null), null, 'null');
    assert.equal(renderShortname(''), '', 'empty string');

    assert.equal(renderShortname(emoji.shortname), expectedEmoji, 'returns html for emoji shortname');
    assert.equal(renderShortname(tone.shortname), expectedToned, 'returns html for toned shortname');
    assert.equal(renderShortname(mixed.shortname), expectedMixed, 'returns html for mixed shortname');
    assert.equal(renderShortname(specialSpacer.shortname), expectedSpecialSpacer, 'returns html for 200d shortname');
    assert.equal(renderShortname(specialEnder.shortname), expectedSpecialEnder, 'returns html for fe0f shortname');

    assert.equal(renderShortname(emoji.shortname, { single: true }), expectedEmoji, 'returns html for emoji shortname - single');
    assert.equal(renderShortname(tone.shortname, { single: true }), expectedToned, 'returns html for toned shortname - single');
    assert.equal(renderShortname(mixed.shortname, { single: true }), expectedMixed, 'returns html for mixed shortname - single');
    assert.equal(renderShortname(specialSpacer.shortname, { single: true }), expectedSpecialSpacer, 'returns html for 200d shortname - single');
    assert.equal(renderShortname(specialEnder.shortname, { single: true }), expectedSpecialEnder, 'returns html for fe0f shortname - single');

    assert.equal(renderShortname(shortnameMix), expectedMix, 'shortname mix');
    assert.equal(renderShortname(textShortnameMix), expectedTextMix, 'text shortname mix');

    assert.equal(renderShortname(HTML), escapedHTML, 'escapes HTML');
    assert.equal(renderShortname(HTML, { unsafe: true }), unescapedHTML, 'can be forced to output unsafe content');

    assert.include(renderShortname(HTML, { className }), className, 'includes className');
  });

  it('render', () => {
    const expectedEmoji = '<img src="/images/emojis-v4.0.0/64/1f953.png" alt="🥓" draggable="false" />';
    const expectedToned = '<img src="/images/emojis-v4.0.0/64/1f44d-1f3ff.png" alt="👍🏿" draggable="false" />';
    const expectedMixed = '<img src="/images/emojis-v4.0.0/64/1f469-1f469-1f466.png" alt="👩‍👩‍👦" draggable="false" />';
    const expectedSpecialSpacer = '<img src="/images/emojis-v4.0.0/64/1f469-1f3fd-1f680.png" alt="👩🏽‍🚀" draggable="false" />';
    const expectedSpecialEnder = '<img src="/images/emojis-v4.0.0/64/1f468-1f3ff-2708.png" alt="👨🏿‍✈️" draggable="false" />';

    const unicodeMix = [
      specialEnder.unicode,
      specialSpacer.unicode,
      mixed.unicode,
      tone.unicode,
      emoji.unicode,
    ].join('');

    const textUnicodeMix = `is ${specialSpacer.unicode}${specialEnder.unicode} good ${tone.unicode} k`;

    const expectedMix = [
      expectedSpecialEnder,
      expectedSpecialSpacer,
      expectedMixed,
      expectedToned,
      expectedEmoji,
    ].join('');
    const expectedTextMix = `is ${expectedSpecialSpacer}${expectedSpecialEnder} good ${expectedToned} k`;

    const HTML = `<span>${specialEnder.unicode}</span>`;
    const escapedHTML = escapeHtml('<span>xxx</span>').replace('xxx', expectedSpecialEnder);
    const unescapedHTML = `<span>${expectedSpecialEnder}</span>`;
    const className = 'MY_UNIQUE_CLASS_NAME_FOR_SURE_THERE';

    const simple = '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    assert.equal(render(), null, 'no arguments');
    assert.equal(render(null), null, 'null');
    assert.equal(render(''), '', 'empty string');

    assert.equal(render(emoji.unicode), expectedEmoji, 'returns html for emoji unicode');
    assert.equal(render(tone.unicode), expectedToned, 'returns html for toned unicode');
    assert.equal(render(mixed.unicode), expectedMixed, 'returns html for mixed unicode');
    assert.equal(render(specialSpacer.unicode), expectedSpecialSpacer, 'returns html for 200d unicode');
    assert.equal(render(specialEnder.unicode), expectedSpecialEnder, 'returns html for fe0f unicode');

    assert.equal(render(emoji.unicode, { single: true }), expectedEmoji, 'returns html for emoji unicode');
    assert.equal(render(tone.unicode, { single: true }), expectedToned, 'returns html for toned unicode');
    assert.equal(render(mixed.unicode, { single: true }), expectedMixed, 'returns html for mixed unicode');
    assert.equal(render(specialSpacer.unicode, { single: true }), expectedSpecialSpacer, 'returns html for 200d unicode');
    assert.equal(render(specialEnder.unicode, { single: true }), expectedSpecialEnder, 'returns html for fe0f unicode');

    assert.equal(render(unicodeMix), expectedMix, 'unicode mix');
    assert.equal(render(textUnicodeMix), expectedTextMix, 'text unicode mix');

    assert.equal(render(HTML), escapedHTML, 'escapes HTML');
    assert.equal(render(HTML, { unsafe: true }), unescapedHTML, 'can be forced to output unsafe content');

    assert.include(render(HTML, { className }), className, 'includes className');

    assert.equal(render(simple, { unsafe: true }), simple, 'doesn\'t replace numbers and letters');
  });

  it('emojiCollection', () => {
    assert.isArray(emojiCollection, 'returns correct datatype');
  });

  it('emojiRegex', () => {
    assert.isString(emojiRegex, 'returns correct datatype');
  });

  it('shortnameRegex', () => {
    assert.isString(shortnameRegex, 'returns correct datatype');
  });
});
