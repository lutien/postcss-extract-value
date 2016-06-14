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

test('option "onlyColor"', t => {
    let input = `.foo {
        color: #000;
        border: 1px solid hsla(120,100%,50%, 0.5);
        width: 10px;
        display: block;
    }`;
    let output = `:root {
        --color-1: #000;
        --border-1: hsla(120,100%,50%, 0.5);\n}\n.foo {
        color: var(--color-1);
        border: 1px solid var(--border-1);
        width: 10px;
        display: block;
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
    return run(t, input, output, { onlyColor: true, filterByProps: ['border'] });
});
