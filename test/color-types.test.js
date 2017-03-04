const run = require('./_run');

it('HSL', () => {
    const input = `.foo {
        border: 1px solid hsl(120, 100%, 50%);
    }`;
    const output = `:root {
        --border-1: hsl(120, 100%, 50%);\n}\n.foo {
        border: 1px solid var(--border-1);
    }`;
    return run(input, output, { onlyColor: true });
});

it('HSLA', () => {
    const input = `.foo {
        border: 1px solid hsla(120, 100%, 50%, 0.5);
    }`;
    const output = `:root {
        --border-1: hsla(120, 100%, 50%, 0.5);\n}\n.foo {
        border: 1px solid var(--border-1);
    }`;
    return run(input, output, { onlyColor: true });
});

it('color keyword', () => {
    const input = `.foo {
        border: 1px solid black;
    }`;
    const output = `:root {
        --border-1: black;\n}\n.foo {
        border: 1px solid var(--border-1);
    }`;
    return run(input, output, { onlyColor: true });
});

it('RGB', () => {
    const input = `.foo {
        border: 1px solid rgb(120, 100, 50);
    }`;
    const output = `:root {
        --border-1: rgb(120, 100, 50);\n}\n.foo {
        border: 1px solid var(--border-1);
    }`;
    return run(input, output, { onlyColor: true });
});

it('RGBA', () => {
    const input = `.foo {
        border: 1px solid rgba(120, 100, 50, 0.4);
    }`;
    const output = `:root {
        --border-1: rgba(120, 100, 50, 0.4);\n}\n.foo {
        border: 1px solid var(--border-1);
    }`;
    return run(input, output, { onlyColor: true });
});

it('short hex', () => {
    const input = `.foo {
        border: 1px solid #000;
    }`;
    const output = `:root {
        --border-1: #000;\n}\n.foo {
        border: 1px solid var(--border-1);
    }`;
    return run(input, output, { onlyColor: true });
});

it('long hex', () => {
    const input = `.foo {
        border: 1px solid #101113;
    }`;
    const output = `:root {
        --border-1: #101113;\n}\n.foo {
        border: 1px solid var(--border-1);
    }`;
    return run(input, output, { onlyColor: true });
});
