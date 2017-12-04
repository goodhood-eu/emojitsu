import { collection, emojiRegex, shortnameRegex } from '../../../vendor/emojis';
import {
  getOptions,
  sanitize,

  hexToImage,

  shortnameToEmoji,
  unicodeToEmoji,

  shortnameToUnicode,
  unicodeToShortname,
} from './utils';

// If strange bugs appear, create new regex in each function
const regexShortname = new RegExp(shortnameRegex, 'g');
const regexUnicode = new RegExp(emojiRegex, 'g');

export const shortnamesToUnicode = (string) => {
  if (typeof string !== 'string') return null;
  return string.replace(regexShortname, shortnameToUnicode);
};
export const unicodeToShortnames = (string) => {
  if (typeof string !== 'string') return null;
  return string.replace(regexUnicode, unicodeToShortname);
};

export const renderShortname = (string, settings) => {
  if (typeof string !== 'string') return null;
  const options = getOptions(settings);

  const compile = (shortname) => {
    const emoji = shortnameToEmoji(shortname);
    // do nothing if shortcode is not recognized
    if (!emoji) return shortname;
    return hexToImage(emoji.hex, options);
  };

  // Trust string in "single character" mode
  if (options.single) return compile(string);
  return sanitize(string, options).replace(regexShortname, compile);
};

export const render = (string, settings) => {
  if (typeof string !== 'string') return null;
  const options = getOptions(settings);

  const compile = (unicode) => {
    const emoji = unicodeToEmoji(unicode);
    // do nothing if unicode is not recognized
    if (!emoji) return unicode;
    return hexToImage(emoji.hex, options);
  };

  // Trust string in "single character" mode
  if (options.single) return compile(string);
  return sanitize(string, options).replace(regexUnicode, compile);
};

export { collection as emojiCollection, emojiRegex, shortnameRegex };
