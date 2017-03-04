const selectorFormatter = require('../lib/selector-formatter');

it('class', () => {
    expect(selectorFormatter('.foo')).toBe('foo');
});

it('id', () => {
    expect(selectorFormatter('#foo')).toBe('foo');
});

it('two classes', () => {
    expect(selectorFormatter('.foo.bar')).toBe('foo-bar');
});

it('two classes', () => {
    expect(selectorFormatter('.foo.bar')).toBe('foo-bar');
});

it('with pseudoclass', () => {
    expect(selectorFormatter('a:hover')).toBe('a-hover');
});

it('with pseudoelement', () => {
    expect(selectorFormatter('a::before')).toBe('a-before');
});

it('with +', () => {
    expect(selectorFormatter('div + p')).toBe('div-p');
});

it('with ~', () => {
    expect(selectorFormatter('div ~ p')).toBe('div-p');
});

it('with >', () => {
    expect(selectorFormatter('div > p')).toBe('div-p');
});

it('with :nth-child(n)', () => {
    expect(selectorFormatter(':nth-child(2n)')).toBe('nth-child-2n');
});

it('with attribute', () => {
    expect(selectorFormatter('[attribute^=value]')).toBe('attribute-value');
});

it('all elements', () => {
    expect(selectorFormatter('*')).toBe('all');
});

it('two elements', () => {
    expect(selectorFormatter('div, p')).toBe('div-p');
});
