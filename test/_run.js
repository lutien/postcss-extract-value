const postcss = require('postcss');
const plugin = require('../lib/index');

module.exports = function run(input, output, opts) {
    const params = opts || {}; // Fix for Node 4
    return postcss([plugin(params)]).process(input)
        .then((result) => {
            expect(result.css).toEqual(output);
            expect(result.warnings().length).toBe(0);
        });
};
