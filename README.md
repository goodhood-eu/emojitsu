Emojitsu
========

In a given string convert unicode and `:shortcode:` emojis to `<img />` tags.

## Unicode version

Currently supported Unicode version: `15.0`. Minimum supported `emoji-assets` version: `8.0.0`.

## Usage:

This package is a collection of utility functions loosely based on `twemoji` and `joypixels` javascript libraries. It
aims to completely replace those with a modern ES implementation, full unicode spec support and flexible image
collection support. SVG sprites are not supported for performance reasons. For best results pair
with https://github.com/joypixels/emoji-assets.

## Functions:

### isSingleEmoji(string)

Determines if string contains only a single emoji. Automatically trims whitespace before checking. Returns bool.

### shortnamesToUnicode(string)

Takes a string with shortnames and returns a string with every known emoji shortname replaced with corresponding unicode
representation. Ignores unknown shortnames.

### unicodeToShortnames(string)

Opposite of `shortnamesToUnicode`.

### renderShortname(string, options)

Takes a string with shortnames and returns a string with every known emoji shortname replaced with an image tag. Useful
for rendering specific emojis when it's easier to use `:bacon:` instead of 🥓. For a list of supported options check
below.

### render(string, options)

Takes a string with unicode emojis and returns a string with every known emoji sequence replaced with an image tag.
Useful for rendering user generated content. For a list of supported options check below.

### emojiCollection

An array of objects containing all supported emojis. Format is:

```
{
  category: "people", // emoji category according to spec
  hex: "1f603", // hex representation used to reference images
  shortname: ":smiley:", // shortname representation, legacy so no aliases are supported
  suggest: true // should this emoji appear in suggestions
}
```

### emojiRegex

String containing regular expression for a single emoji character supported by this library. Usage:

```
const myRegex = new RegExp(emojiRegex); // do stuff
```

### shortnameRegex

Same as `emojiRegex`, but for shortnames.

## Options:

Render functions and some helper functions support these options. This list contains keys and their default values.

```
{
  size: 64, // size of emojis to use when the default CDN is used
  className: null, // CSS class to use when rendering image tags
  unsafe: false, // when set to true, render will NOT sanitize the string, e.g. it forces "unsafe" output
  single: false, // when a string contains just a single emoji this speeds up render a bit
  cdn: undefined, // a CDN to use for image paths
}
```

By default, the path to emoji images is constructed like this: `/images/emojis-v${version}/${size}`. `version` is
the https://github.com/joypixels/emoji-assets version used to generate the emojis.json file and `size` is the asset
size (32/64/128).

Example output: `/images/emojis-v7.0.1/64/1f603.png`. When `cdn` option is specified, it will be used
instead. When just a `size` is specified, default path will be used with `size` being replaced by the one provided in
options.
