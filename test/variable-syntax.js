import test from 'ava';
import run from './_run';

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
        templateVariableName: 'theme[propertyName]',
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
        templateVariableName: 'theme[propertyName]',
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
