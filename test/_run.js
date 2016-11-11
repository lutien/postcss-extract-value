const postcss = require('postcss');
const plugin = require('../lib/index');

module.exports = function run(t, input, output, opts) {
    const params = opts || {}; // Fix for Node 4
    return postcss([plugin(params)]).process(input)
        .then((result) => {
            t.deepEqual(result.css, output);
            t.deepEqual(result.warnings().length, 0);
        });
};
