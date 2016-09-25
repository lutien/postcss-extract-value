import postcss from 'postcss';
import test from 'ava';

import plugin from './';

function run(t, input, output, opts = { }) {
    return postcss([plugin(opts)]).process(input)
        .then((result) => {
            t.deepEqual(result.css, output);
            t.deepEqual(result.warnings().length, 0);
        });
}

const optDefault = {
    filterByProps: ['color', 'border-color'],
};

test('default settings', (t) => {
    const input = `.foo {
        color: #000;
        width: 10px;
        display: block;
    }`;
    const output = `:root {
        --color-1: #000;
        --width-1: 10px;
        --display-1: block;\n}\n.foo {
        color: var(--color-1);
        width: var(--width-1);
        display: var(--display-1);
    }`;
    return run(t, input, output, { });
});

test('repeated values', (t) => {
    const input = `.foo {
        color: blue;
    }
    .bar {
        color: blue;
    }`;
    const output = `:root {
        --color-1: blue;\n}
    .foo {
        color: var(--color-1);
    }
    .bar {
        color: var(--color-1);
    }`;
    return run(t, input, output, optDefault);
});

/** *************Color types*********************** **/
test('HSL', (t) => {
    const input = `.foo {
        border: 1px solid hsl(120, 100%, 50%);
    }`;
    const output = `:root {
        --border-1: hsl(120, 100%, 50%);\n}\n.foo {
        border: 1px solid var(--border-1);
    }`;
    return run(t, input, output, { onlyColor: true });
});

test('HSLA', (t) => {
    const input = `.foo {
        border: 1px solid hsla(120, 100%, 50%, 0.5);
    }`;
    const output = `:root {
        --border-1: hsla(120, 100%, 50%, 0.5);\n}\n.foo {
        border: 1px solid var(--border-1);
    }`;
    return run(t, input, output, { onlyColor: true });
});

test('color keyword', (t) => {
    const input = `.foo {
        border: 1px solid black;
    }`;
    const output = `:root {
        --border-1: black;\n}\n.foo {
        border: 1px solid var(--border-1);
    }`;
    return run(t, input, output, { onlyColor: true });
});

test('RGB', (t) => {
    const input = `.foo {
        border: 1px solid rgb(120, 100, 50);
    }`;
    const output = `:root {
        --border-1: rgb(120, 100, 50);\n}\n.foo {
        border: 1px solid var(--border-1);
    }`;
    return run(t, input, output, { onlyColor: true });
});

test('RGBA', (t) => {
    const input = `.foo {
        border: 1px solid rgba(120, 100, 50, 0.4);
    }`;
    const output = `:root {
        --border-1: rgba(120, 100, 50, 0.4);\n}\n.foo {
        border: 1px solid var(--border-1);
    }`;
    return run(t, input, output, { onlyColor: true });
});

test('short hex', (t) => {
    const input = `.foo {
        border: 1px solid #000;
    }`;
    const output = `:root {
        --border-1: #000;\n}\n.foo {
        border: 1px solid var(--border-1);
    }`;
    return run(t, input, output, { onlyColor: true });
});

test('long hex', (t) => {
    const input = `.foo {
        border: 1px solid #101113;
    }`;
    const output = `:root {
        --border-1: #101113;\n}\n.foo {
        border: 1px solid var(--border-1);
    }`;
    return run(t, input, output, { onlyColor: true });
});

/** ************************************************** **/

test('exist root element', (t) => {
    const input = `:root {
        --base-font-size: 16px;
    }
    .foo {
        color: #000;
        font-size: var(--base-font-size);
    }`;
    const output = `:root {
        --base-font-size: 16px;
        --color-1: #000;
    }
    .foo {
        color: var(--color-1);
        font-size: var(--base-font-size);
    }`;
    return run(t, input, output, { });
});

test('several colors in one property', (t) => {
    const input = `.foo {
        box-shadow: inset 0 2px 0px #dcffa6, 0 2px 5px #000;
    }`;
    const output = `:root {
        --box-shadow-1: #dcffa6;
        --box-shadow-2: #000;\n}\n.foo {
        box-shadow: inset 0 2px 0px var(--box-shadow-1), 0 2px 5px var(--box-shadow-2);
    }`;
    return run(t, input, output, { onlyColor: true });
});

test('custom element for css variables', (t) => {
    const input = `.foo {
        --color-1: black;
    }
    .bar {
        border-color: red;
    }`;
    const output = `.foo {
        --color-1: black;
        --border-color-1: red;
    }
    .bar {
        border-color: var(--border-color-1);
    }`;
    return run(t, input, output, { scope: '.foo' });
});

test('filter by color and props', (t) => {
    const input = `.foo {
        border: 1px solid #000;
        background-color: red;
    }`;
    const output = `:root {
        --border-1: #000;\n}\n.foo {
        border: 1px solid var(--border-1);
        background-color: red;
    }`;
    return run(t, input, output, {
        onlyColor: true,
        filterByProps: ['border'],
    });
});

test('default value in css variable', (t) => {
    const input = `:root {
        --base-color: #fff;
    }
    .foo {
        color: var(--base-color, #000);
        border: 1px solid #eee;
    }`;
    const output = `:root {
        --base-color: #fff;
        --border-1: #eee;
    }
    .foo {
        color: var(--base-color, #000);
        border: 1px solid var(--border-1);
    }`;
    return run(t, input, output, { onlyColor: true });
});

test('variable with several color values', (t) => {
    const input = `:root {
        --base-color: #fff;
    }
    .foo {
        border: 1px solid var(--base-color),
        2px solid #000;
    }`;
    const output = `:root {
        --base-color: #fff;
        --border-1: #000;
    }
    .foo {
        border: 1px solid var(--base-color),
        2px solid var(--border-1);
    }`;
    return run(t, input, output, { onlyColor: true });
});

test('variable template', (t) => {
    const input = `.foo {
        border: 2px solid #000;
    }`;
    const output = `:root {
        --theme-black-1: #000;\n}\n.foo {
        border: 2px solid var(--theme-black-1);
    }`;
    return run(t, input, output, { onlyColor: true, templateVariableName: 'theme[colorKeyword]' });
});

test('variable template with two black colors', (t) => {
    const input = `.foo {
        border: 2px solid #000;
        color: #020202;
    }`;
    const output = `:root {
        --theme-black-1: #000;
        --theme-black-2: #020202;\n}\n.foo {
        border: 2px solid var(--theme-black-1);
        color: var(--theme-black-2);
    }`;
    return run(t, input, output, { onlyColor: true, templateVariableName: 'theme[colorKeyword]' });
});

test('variable template with light and dark color', (t) => {
    const input = `.foo {
        border: 2px solid #cc0000;
        color: #ff0000;
        background-color: rgb(255, 26, 26);
    }`;
    const output = `:root {
        --theme-dark-red-1: #cc0000;
        --theme-red-1: #ff0000;
        --theme-light-red-1: rgb(255, 26, 26);\n}\n.foo {
        border: 2px solid var(--theme-dark-red-1);
        color: var(--theme-red-1);
        background-color: var(--theme-light-red-1);
    }`;
    return run(t, input, output, {
        onlyColor: true,
        templateVariableName: 'theme[tint][colorKeyword]',
    });
});

test('variable template with tint', (t) => {
    const input = `.foo {
        border: 2px solid #000;
        color: #020202;
        background-color: #0d0d0d;
    }`;
    const output = `:root {
        --black-1: #000;
        --black-light-1: #020202;
        --black-light-2: #0d0d0d;\n}\n.foo {
        border: 2px solid var(--black-1);
        color: var(--black-light-1);
        background-color: var(--black-light-2);
    }`;
    return run(t, input, output, { onlyColor: true, templateVariableName: '[colorKeyword][tint]' });
});

test('variable template with tint in the beginning', (t) => {
    const input = `.foo {
        border: 2px solid #000;
        color: #020202;
        background-color: #0d0d0d;
    }`;
    const output = `:root {
        --black-1: #000;
        --light-black-1: #020202;
        --light-black-2: #0d0d0d;\n}\n.foo {
        border: 2px solid var(--black-1);
        color: var(--light-black-1);
        background-color: var(--light-black-2);
    }`;
    return run(t, input, output, { onlyColor: true, templateVariableName: '[tint][colorKeyword]' });
});

test('template with propertyName', (t) => {
    const input = `.foo {
        border: 1px solid #000;
        background-color: red;
    }`;
    const output = `:root {
        --theme-border-1: 1px solid #000;
        --theme-background-color-1: red;\n}\n.foo {
        border: var(--theme-border-1);
        background-color: var(--theme-background-color-1);
    }`;
    return run(t, input, output, {
        templateVariableName: 'theme-[propertyName]',
    });
});

test('sass variable syntax', (t) => {
    const input = `.foo {
        border: 1px solid #000;
        background-color: red;
    }`;
    const output = `$theme-border-1: 1px solid #000;\n$theme-background-color-1: red;\n.foo {
        border: $theme-border-1;
        background-color: $theme-background-color-1;
    }`;
    return run(t, input, output, {
        templateVariableName: 'theme-[propertyName]',
        variableSyntax: 'sass',
    });
});

test('less variable syntax', (t) => {
    const input = `.foo {
        border: 1px solid #000;
        background-color: red;
    }
    .bar {
        border: blue;
    }`;
    const output = `@theme-border-1: 1px solid #000;
    @theme-background-color-1: red;
    @theme-border-2: blue;
    .foo {
        border: @theme-border-1;
        background-color: @theme-background-color-1;
    }
    .bar {
        border: @theme-border-2;
    }`;
    return run(t, input, output, {
        templateVariableName: 'theme-[propertyName]',
        variableSyntax: 'less',
    });
});

test('variable template with tint and sass syntax', (t) => {
    const input = `.foo {
        border: 2px solid #000;
        color: #020202;
        background-color: #0d0d0d;
    }`;
    const output = `$black-1: #000;\n$black-light-1: #020202;\n$black-light-2: #0d0d0d;\n.foo {
        border: 2px solid $black-1;
        color: $black-light-1;
        background-color: $black-light-2;
    }`;
    return run(t, input, output, {
        onlyColor: true,
        templateVariableName: '[colorKeyword][tint]',
        variableSyntax: 'sass',
    });
});
