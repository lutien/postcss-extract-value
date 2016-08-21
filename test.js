import postcss from 'postcss';
import test    from 'ava';

import plugin from './';

function run(t, input, output, opts = { }) {
    return postcss([ plugin(opts) ]).process(input)
        .then( result => {
            t.deepEqual(result.css, output);
            t.deepEqual(result.warnings().length, 0);
        });
}

const optDefault = {
    filterByProps: ['color', 'border-color']
};

test('default settings', t => {
    let input = `.foo {
        color: #000;
        width: 10px;
        display: block;
    }`;
    let output = `:root {
        --color-1: #000;
        --width-1: 10px;
        --display-1: block;\n}\n.foo {
        color: var(--color-1);
        width: var(--width-1);
        display: var(--display-1);
    }`;
    return run(t, input, output, { });
});

test('repeated values', t => {
    let input = `.foo {
        color: blue;
    }
    .bar {
        color: blue;
    }`;
    let output = `:root {
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
test('HSL', t => {
    let input = `.foo {
        border: 1px solid hsl(120, 100%, 50%);
    }`;
    let output = `:root {
        --border-1: hsl(120, 100%, 50%);\n}\n.foo {
        border: 1px solid var(--border-1);
    }`;
    return run(t, input, output, { onlyColor: true });
});

test('HSLA', t => {
    let input = `.foo {
        border: 1px solid hsla(120, 100%, 50%, 0.5);
    }`;
    let output = `:root {
        --border-1: hsla(120, 100%, 50%, 0.5);\n}\n.foo {
        border: 1px solid var(--border-1);
    }`;
    return run(t, input, output, { onlyColor: true });
});

test('color keyword', t => {
    let input = `.foo {
        border: 1px solid black;
    }`;
    let output = `:root {
        --border-1: black;\n}\n.foo {
        border: 1px solid var(--border-1);
    }`;
    return run(t, input, output, { onlyColor: true });
});

test('RGB', t => {
    let input = `.foo {
        border: 1px solid rgb(120, 100, 50);
    }`;
    let output = `:root {
        --border-1: rgb(120, 100, 50);\n}\n.foo {
        border: 1px solid var(--border-1);
    }`;
    return run(t, input, output, { onlyColor: true });
});

test('RGBA', t => {
    let input = `.foo {
        border: 1px solid rgba(120, 100, 50, 0.4);
    }`;
    let output = `:root {
        --border-1: rgba(120, 100, 50, 0.4);\n}\n.foo {
        border: 1px solid var(--border-1);
    }`;
    return run(t, input, output, { onlyColor: true });
});

test('short hex', t => {
    let input = `.foo {
        border: 1px solid #000;
    }`;
    let output = `:root {
        --border-1: #000;\n}\n.foo {
        border: 1px solid var(--border-1);
    }`;
    return run(t, input, output, { onlyColor: true });
});

test('long hex', t => {
    let input = `.foo {
        border: 1px solid #101113;
    }`;
    let output = `:root {
        --border-1: #101113;\n}\n.foo {
        border: 1px solid var(--border-1);
    }`;
    return run(t, input, output, { onlyColor: true });
});

/** ************************************************** **/

test('exist root element', t => {
    let input = `:root {
        --base-font-size: 16px;
    }
    .foo {
        color: #000;
        font-size: var(--base-font-size);
    }`;
    let output = `:root {
        --base-font-size: 16px;
        --color-1: #000;
    }
    .foo {
        color: var(--color-1);
        font-size: var(--base-font-size);
    }`;
    return run(t, input, output, { });
});

test('several colors in one property', t => {
    let input = `.foo {
        box-shadow: inset 0 2px 0px #dcffa6, 0 2px 5px #000;
    }`;
    let output = `:root {
        --box-shadow-1: #dcffa6;
        --box-shadow-2: #000;\n}\n.foo {
        box-shadow: inset 0 2px 0px var(--box-shadow-1), 0 2px 5px var(--box-shadow-2);
    }`;
    return run(t, input, output, { onlyColor: true });
});

test('custom element for css variables', t => {
    let input = `.foo {
        --color-1: black;
    }
    .bar {
        border-color: red;
    }`;
    let output = `.foo {
        --color-1: black;
        --border-color-1: red;
    }
    .bar {
        border-color: var(--border-color-1);
    }`;
    return run(t, input, output, { scope: '.foo' });
});

test('filter by color and props', t => {
    let input = `.foo {
        border: 1px solid #000;
        background-color: red;
    }`;
    let output = `:root {
        --border-1: #000;\n}\n.foo {
        border: 1px solid var(--border-1);
        background-color: red;
    }`;
    return run(t, input, output, {
        onlyColor: true,
        filterByProps: ['border']
    });
});

test('default value in css variable', t => {
    let input = `:root {
        --base-color: #fff;
    }
    .foo {
        color: var(--base-color, #000);
        border: 1px solid #eee;
    }`;
    let output = `:root {
        --base-color: #fff;
        --border-1: #eee;
    }
    .foo {
        color: var(--base-color, #000);
        border: 1px solid var(--border-1);
    }`;
    return run(t, input, output, { onlyColor: true });
});

test('variable with several color values', t => {
    let input = `:root {
        --base-color: #fff;
    }
    .foo {
        border: 1px solid var(--base-color),
        2px solid #000;
    }`;
    let output = `:root {
        --base-color: #fff;
        --border-1: #000;
    }
    .foo {
        border: 1px solid var(--base-color),
        2px solid var(--border-1);
    }`;
    return run(t, input, output, { onlyColor: true });
});

test('variable template', t => {
    let input = `.foo {
        border: 2px solid #000;
    }`;
    let output = `:root {
        --theme-black-1: #000;\n}\n.foo {
        border: 2px solid var(--theme-black-1);
    }`;
    return run(t, input, output, { onlyColor: true, templateVariableName: 'theme[colorKeyword]' });
});

test('variable template with two black colors', t => {
    let input = `.foo {
        border: 2px solid #000;
        color: #020202;
    }`;
    let output = `:root {
        --theme-black-1: #000;
        --theme-black-2: #020202;\n}\n.foo {
        border: 2px solid var(--theme-black-1);
        color: var(--theme-black-2);
    }`;
    return run(t, input, output, { onlyColor: true, templateVariableName: 'theme[colorKeyword]' });
});

test('variable template with light and dark color', t => {
    let input = `.foo {
        border: 2px solid #cc0000;
        color: #ff0000;
        background-color: rgb(255, 26, 26);
    }`;
    let output = `:root {
        --theme-dark-red-1: #cc0000;
        --theme-red-1: #ff0000;
        --theme-light-red-1: rgb(255, 26, 26);\n}\n.foo {
        border: 2px solid var(--theme-dark-red-1);
        color: var(--theme-red-1);
        background-color: var(--theme-light-red-1);
    }`;
    return run(t, input, output, { onlyColor: true, templateVariableName: 'theme[tint][colorKeyword]' });
});

test('variable template with tint', t => {
    let input = `.foo {
        border: 2px solid #000;
        color: #020202;
        background-color: #0d0d0d;
    }`;
    let output = `:root {
        --black-1: #000;
        --black-light-1: #020202;
        --black-light-2: #0d0d0d;\n}\n.foo {
        border: 2px solid var(--black-1);
        color: var(--black-light-1);
        background-color: var(--black-light-2);
    }`;
    return run(t, input, output, { onlyColor: true, templateVariableName: '[colorKeyword][tint]' });
});

test('variable template with tint in the beginning', t => {
    let input = `.foo {
        border: 2px solid #000;
        color: #020202;
        background-color: #0d0d0d;
    }`;
    let output = `:root {
        --black-1: #000;
        --light-black-1: #020202;
        --light-black-2: #0d0d0d;\n}\n.foo {
        border: 2px solid var(--black-1);
        color: var(--light-black-1);
        background-color: var(--light-black-2);
    }`;
    return run(t, input, output, { onlyColor: true, templateVariableName: '[tint][colorKeyword]' });
});

test('template with propertyName', t => {
    let input = `.foo {
        border: 1px solid #000;
        background-color: red;
    }`;
    let output = `:root {
        --theme-border-1: 1px solid #000;
        --theme-background-color-1: red;\n}\n.foo {
        border: var(--theme-border-1);
        background-color: var(--theme-background-color-1);
    }`;
    return run(t, input, output, {
        templateVariableName: 'theme-[propertyName]'
    });
});
