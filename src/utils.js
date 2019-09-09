import escapeHtml from 'escape-html';
import { hexToId, unicodeToCodePoint, codePointToUnicode } from './conversions';
import { collection, assetsVersion } from '../vendor/emojis';

const AVAILABLE_SIZES = {
  32: true,
  64: true,
  128: true,
};

const defaultOptions = {
  size: 64,
  className: null,
  unsafe: false,
  single: false,
};

export const imagePath = `/images/emojis-${assetsVersion}`;

export const codepointsHash = collection.reduce((acc, item) => {
  acc[hexToId(item.hex)] = item;
  return acc;
}, {});
export const shortnamesHash = collection.reduce((acc, item) => {
  acc[item.shortname] = item;
  return acc;
}, {});


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
