/* eslint no-bitwise: "off" */
import escapeHtml from 'escape-html';
import { collection } from '../../../vendor/emojis';

const imagePath = '/images/emojis-v3.1.1';
const AVAILABLE_SIZES = {
  32: true,
  64: true,
  128: true,
};

const regexServiceChar = /(-fe0f|-fe0e|-200d)/g;

const defaultOptions = {
  size: 64,
  className: null,
  unsafe: false,
  single: false,
};

const padLeft = (string) => {
  if (string.length >= 4) return string;
  return `000${string}`.slice(-4);
};

export const hexToId = (hex) => hex.replace(regexServiceChar, '');

export const codepointsHash = collection.reduce((acc, item) => {
  acc[hexToId(item.hex)] = item;
  return acc;
}, {});
export const shortnamesHash = collection.reduce((acc, item) => {
  acc[item.shortname] = item;
  return acc;
}, {});

// Converts unicode to a hex string.
// A combination of fixed charCodeAt and converting number to base 16
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt
// https://github.com/twitter/twemoji/blob/gh-pages/twemoji-generator.js#L849
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
// https://github.com/twitter/twemoji/blob/gh-pages/twemoji-generator.js#L807
export const fromCodePoint = (codepoint) => {
  const code = parseInt(codepoint, 16);
  if (code < 0x10000) return String.fromCharCode(code);

  const base = code - 0x10000;
  return String.fromCharCode(0xD800 + (base >> 10), 0xDC00 + (base & 0x3FF));
};

export const codePointToUnicode = (hex) => (
  hex.split('-').map((point) => fromCodePoint(point)).join('')
);

export const unicodeToEmoji = (unicode) => codepointsHash[hexToId(unicodeToCodePoint(unicode))];
export const shortnameToEmoji = (shortname) => shortnamesHash[shortname];

export const shortnameToUnicode = (shortname) => {
  const emoji = shortnamesHash[shortname];

  // do nothing if shortcode is not recognized
  if (!emoji) return shortname;
  return codePointToUnicode(emoji.hex);
};

export const unicodeToShortname = (unicode) => {
  const emoji = unicodeToEmoji(unicode);

  // do nothing if unicode is not recognized
  if (!emoji) return unicode;
  return emoji.shortname;
};

export const sanitize = (string, options) => (
  (options && options.unsafe) ? string : escapeHtml(string)
);
export const getOptions = (options) => ({ ...defaultOptions, ...options });

export const getImageSrc = (icon, prefix) => {
  let cdn = prefix;

  if (typeof prefix !== 'string') {
    const imageSize = AVAILABLE_SIZES[prefix] ? prefix : 64;
    cdn = `${imagePath}/${imageSize}`;
  }

  return `${cdn}/${icon}.png`;
};

export const hexToImage = (hex, options = {}) => {
  const { size, className, cdn } = options;
  const src = getImageSrc(hexToId(hex), cdn || size);
  const alt = codePointToUnicode(hex);

  let propsString = `src="${src}" alt="${alt}" draggable="false"`;
  if (className) propsString += ` class="${className}"`;

  return `<img ${propsString} />`;
};
