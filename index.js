var postcss = require('postcss');

module.exports = postcss.plugin('postcss-extract-value', function (opts) {
    opts = opts || {};
    var filterByProps = opts.filterByProps,
        onlyColor = opts.onlyColor;

    function checkColor(value) {
        return /#\w+|rgb|hsl/.test(value);
    }

    function extractColor(value) {
        var hex = /#\w+/,
            rgb = /rgb(a*)\(([0-9]+,*\s*)*((0|1)\.*[0-9]*)\)/,
            hls = /hsl(a*)\(([0-9]+%*,*\s*)*((0|1)\.*[0-9]*)\)/,
            regExp = new RegExp(hex.source + '|' + rgb.source +
                '|' + hls.source),
            result = regExp.exec(value);
        return result && result[0] || value;
    }

    function checkProp(filter, prop) {
        return filter.indexOf(prop) > -1;
    }

    function makeCSSVariable(prop, num) {
        return '--' + prop + '-' + num;
    }

    function addCSSVariable(root, prop, value, num) {
        root.append(makeCSSVariable(prop, ++num) + ': ' + value);
    }

    function extractValue(decl, storePropsLink, valueFiltered) {
        var positionValue = storePropsLink.indexOf(valueFiltered) + 1;
        var variable = 'var(' + makeCSSVariable(decl.prop, positionValue) + ')';
        decl.value = decl.value.replace(valueFiltered, variable);
    }

    return function (css) {
        var root = css.root(),
            storeProps = {},
            storePropsLink = {},
            checkColorFilter = true,
            checkPropFilter = true,
            valueFiltered = '',
            rootSel = null;

        css.walkRules(function (rule) {

            if (rule.selector === ':root') {
                rootSel = rule;
            } else {
                rule.walkDecls(function (decl) {
                    checkColorFilter = !onlyColor ||
                        onlyColor && checkColor(decl.value);

                    checkPropFilter = !filterByProps ||
                        filterByProps && checkProp(filterByProps, decl.prop);

                    if (checkColorFilter && checkPropFilter) {
                        if (!storeProps[decl.prop]) {
                            storeProps[decl.prop] = [];
                        }
                        storePropsLink = storeProps[decl.prop];

                        if (checkColorFilter) {
                            valueFiltered = extractColor(decl.value);
                        } else {
                            valueFiltered = decl.value;
                        }
                        if (valueFiltered.indexOf('var') === -1) {
                            if (storePropsLink.indexOf(valueFiltered) === -1) {
                                storePropsLink.push(valueFiltered);
                            }
                            extractValue(decl, storePropsLink, valueFiltered);
                        }
                    }
                });
            }
        });
        if (!rootSel) {
            rootSel = postcss.rule({ selector: ':root' });
            root.prepend(rootSel);
        }
        for (var prop in storeProps) {
            storeProps[prop].forEach(addCSSVariable.bind(this, rootSel, prop));
        }
    };
});
