Emojitsu
========

In a given string convert unicode and :shortcode: emojis to <img /> tags.

## Usage:

This package is a collection of utility methods loosely based to `twemoji` and `emojione` javascript libraries. It aims to completely replace those with modern ES implementation, full unicode spec support and flexible image support. SVG sprites are not used for performance reasons.

## Methods:

### shortnamesToUnicode(string)
Takes a string with shortnames and returns string with every known emoji shortname replaced with corresponding unicode representation. Ignores unknown shortnames.

### unicodeToShortnames(string)
Opposite of `shortnamesToUnicode`

### renderShortname(string, options)
Takes a string with shortnames and returns string with every known emoji shortname replaced with an image tag. Useful for rendering specific emojis when it's easier to use :bacon: instead of 🥓. For a list of supported options check below.

### render(string, options)
Takes a string with unicode emojis and returns string with every known emoji sequence replaced with an image tag. Useful for rendering user generated content. For a list of supported options check below.

### emojiCollection
An array of objects containing all supported emojis. Format is:
```
category: "people", // Category of emoji according to spec
hex: "1f603", // Hex representation used by a CDN hosting images
shortname: ":smiley:", // Shortname representation. This is more of a legacy thing so no aliases are supported.
suggest: true // Should this emoji appear in suggestions
```
### emojiRegex
String containing regular expression for a single emoji character supported by this library. Usage:
```
const myRegex = new RegExp(emojiRegex); // do stuff
```
### shortnameRegex
Same as `emojiRegex`, but for shortnames

## Options:
Render methods and some helper methods support these options. This list contains keys and their default values.

```
{
  size: 64, // size of emojis to use when the default CDN is used
  className: null, // rendered image class
  unsafe: false, // when set to true, render will NOT sanitize the string, e.g. it forces "unsafe" output
  single: false, // when a string contains just a single emoji this speeds render a bit
  cdn: undefined, // a CDN to use for image paths.
}
```

By default the path to emoji images is constructed like this: `/images/emojis-v${version}/${size}` where version is `emojione-assets` version used to generate the emojis.json file and size is asset size (32/64/128). Example output: `/images/emojis-v3.1.1/64/1f603.png`. When `cdn` option is specified it will be used instead. When just a size is specified, default path will be used with size being replaced by the one provided in options.
