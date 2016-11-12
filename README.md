# PostCSS Extract Value [![Build Status][ci-img]][ci] [![Coverage Status](https://coveralls.io/repos/github/lutien/postcss-extract-value/badge.svg)](https://coveralls.io/github/lutien/postcss-extract-value)

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

## Usage ##

```js
import postcssExtractValue from 'postcss-extract-value';

postcss([
    postcssExtractValue(/* options */),
    // more plugins...
])
```

## Options ##

#### filterByProps ####

Type: `array`<br>
Required: `false`<br>
Default: `[]`

You can add names of css properties and only from this properties will be extracted values.

#### onlyColor ####

Type: `boolean`<br>
Required: `false`<br>
Default: `false`

If you set true, only colors (hex, rgb, hsl, color keywords) will be extracted from values.

#### scope ####

Type: `string`<br>
Required: `false`<br>
Default: `:root`

You can set custom selector, which will contain variables.

#### variableSyntax ####

Type: `string`<br>
Required: `false`<br>
Default: ``

By default it will be used css variables syntax, other available variants **less** and **sass**.

#### templateVariableName ####

Type: `string`<br>
Required: `false`<br>
Default: ``

You can set template for variables using special words.
See more information below.


## Usage templateVariableName ##

### With options _filterByProps_ or without any options by default: ###

#### [propertyName] ####
Name of css property (width, border, etc.).

```js
postcss([
    postcssExtractValue({
        templateVariableName: 'theme[propertyName]'
    }),
])
```
```css
.foo {
     width: 100px;
}
```

```css
:root {
    --theme-width-1: 100px;
}
.foo {
    width: var(--theme-width-1);
}
```

### With options _onlyColor_: ###

#### [colorKeyword] ####
Color keyword of the nearest color.

#### [tint] ####
Deviation in the dark or light side from the nearest color. (light\dark)

 ```js
 postcss([
     postcssExtractValue({
          templateVariableName: 'theme[tint][colorKeyword]',
     }),
 ])
 ```
 ```css
 .foo {
     border: 2px solid #cc0000;
     color: #ff0000;
     background-color: rgb(255, 26, 26);
 }
 ```

 ```css
:root {
    --theme-dark-red-1: #cc0000;
    --theme-red-1: #ff0000;
    --theme-light-red-1: rgb(255, 26, 26);
}
.foo {
    border: 2px solid var(--theme-dark-red-1);
    color: var(--theme-red-1);
    background-color: var(--theme-light-red-1);
}
 ```
 
### Others ###

#### [selectorName] ####
 Name of css selector (className, id, etc.)
 
 ```js
 postcss([
     postcssExtractValue({
         templateVariableName: 'theme[selectorName]'
     }),
 ])
 ```
 ```css
 .foo {
      width: 100px;
 }
 ```
 
 ```css
 :root {
     --theme-foo-1: 100px;
 }
 .foo {
     width: var(--theme-foo-1);
 }
 ```

See [PostCSS] docs for examples for your environment.
