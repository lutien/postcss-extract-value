import test from 'ava';
import selectorFormatter from '../lib/selector-formatter';

test('class', (t) => {
    t.is(selectorFormatter('.foo'), 'foo');
});

test('id', (t) => {
    t.is(selectorFormatter('#foo'), 'foo');
});

test('two classes', (t) => {
    t.is(selectorFormatter('.foo.bar'), 'foo-bar');
});

test('two classes', (t) => {
    t.is(selectorFormatter('.foo.bar'), 'foo-bar');
});

test('with pseudoclass', (t) => {
    t.is(selectorFormatter('a:hover'), 'a-hover');
});

test('with pseudoelement', (t) => {
    t.is(selectorFormatter('a::before'), 'a-before');
});

test('with +', (t) => {
    t.is(selectorFormatter('div + p'), 'div-p');
});

test('with ~', (t) => {
    t.is(selectorFormatter('div ~ p'), 'div-p');
});

test('with >', (t) => {
    t.is(selectorFormatter('div > p'), 'div-p');
});

test('with :nth-child(n)', (t) => {
    t.is(selectorFormatter(':nth-child(2n)'), 'nth-child-2n');
});

test('with attribute', (t) => {
    t.is(selectorFormatter('[attribute^=value]'), 'attribute-value');
});

test('all elements', (t) => {
    t.is(selectorFormatter('*'), 'all');
});

test('two elements', (t) => {
    t.is(selectorFormatter('div, p'), 'div-p');
});
