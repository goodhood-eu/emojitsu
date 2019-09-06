/* eslint no-bitwise: "off" */

const padLeft = (string) => {
  if (string.length >= 4) return string;
  return `000${string}`.slice(-4);
};

const regexServiceChar = /(-fe0f|-fe0e|-200d)/g;

export const hexToId = (hex) => hex.replace(regexServiceChar, '');

// Converts unicode to a hex string.
// A combination of fixed charCodeAt and converting number to base 16
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt
// https://github.com/twitter/twemoji/blob/c9a665abb2f2bbea66013df9c545b387e64b2217/twemoji-generator.js#L849
export const unicodeToCodePoint = (unicode, separator = '-') => {
  const result = [];
  let pair = 0;

  for (let i = 0; i < unicode.length; i += 1) {
    const charCode = unicode.charCodeAt(i);

    if (pair) {
      result.push((0x10000 + ((pair - 0xD800) << 10) + (charCode - 0xDC00)).toString(16));
      pair = 0;
    } else if (charCode >= 0xD800 && charCode <= 0xDBFF) {
      pair = charCode;
    } else {
      result.push(charCode.toString(16));
    }
  }

  return result.map(padLeft).join(separator);
};

// Converts codepoint string to a unicode character
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCodePoint
// https://github.com/twitter/twemoji/blob/c9a665abb2f2bbea66013df9c545b387e64b2217/twemoji-generator.js#L807
export const fromCodePoint = (codepoint) => {
  const code = parseInt(codepoint, 16);
  if (code < 0x10000) return String.fromCharCode(code);

  const base = code - 0x10000;
  return String.fromCharCode(0xD800 + (base >> 10), 0xDC00 + (base & 0x3FF));
};

export const codePointToUnicode = (hex) => (
  hex.split('-').map((point) => fromCodePoint(point)).join('')
);
