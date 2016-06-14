# PostCSS Extract Value [![Build Status][ci-img]][ci]

[PostCSS] plugin to extract values from css properties and put them into variables.

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/lutien/postcss-extract-value.svg
[ci]:      https://travis-ci.org/lutien/postcss-extract-value

```css
.foo {
     width: 100px;
     color: #000;
     margin: 10px;
}
.bar {
     color: #000;
     margin: 15px;
}
```

```css
:root {
    --width-1: 100px;
    --color-1: #000;
    --margin-1: 10px;
    --margin-2: 15px;
}
.foo {
    width: var(--width-1);
    color: var(--color-1);
    margin: var(--margin-1);
}
.bar {
    color: var(--color-1);
    margin: var(--margin-2);
}
```

## Usage

```js
import postcssExtractValue from 'postcss-extract-value';

postcss([
    postcssExtractValue(/* options */),
    // more plugins...
])
```

## Options

### filterByProps

Type: `array`<br>
Required: `false`<br>
Default: `[]`

You can add names of css properties and only from this properties will be extracted values.

### onlyColor

Type: `boolean`<br>
Required: `false`<br>
Default: `false`

If you set true, only colors (hex, rgb, hsl, color keywords) will be extracted from values.


See [PostCSS] docs for examples for your environment.
