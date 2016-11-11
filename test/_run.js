const postcss = require('postcss');
const plugin = require('../lib/index');

module.exports = function run(t, input, output, opts = { }) {
    return postcss([plugin(opts)]).process(input)
        .then((result) => {
            t.deepEqual(result.css, output);
            t.deepEqual(result.warnings().length, 0);
        });
};
