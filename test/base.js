import test from 'ava';
import run from './_run';

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
