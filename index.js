var postcss = require('postcss');

module.exports = postcss.plugin('postcss-extract-value', function (opts) {
    opts = opts || {};

    // Cache RegExp
    var reCheck = /#\w+|rgba?|hsla?/;
    var reCSSVariable = /var\(-{2}\w{1}[\w+-]*/;
    var reHex = /#(\w{6}|\w{3})/;
    var reRgb = /rgba?\([\d,.\s]+\)/;
    var reHls = /hsla?\(\s?[0-9]{1,3},\s?(([0-9]{1,3})+%,\s?){2}[0-9.]+\s?\)/;
    var reExtract = new RegExp(reHex.source + '|' + reRgb.source + '|' +
        reHls.source, 'g');

    // Options
    var filterByProps = opts.filterByProps,
        onlyColor = opts.onlyColor;

    function checkColor(value) {
        return reCheck.test(value);
    }

    function extractColor(value) {
        var resultArray = [];
        var result = [];
        while ((result = reExtract.exec(value)) !== null) {
            resultArray.push(result[0]);
        }
        return resultArray;
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
            valueFilteredList = [],
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

                        if (onlyColor) {
                            valueFilteredList = extractColor(decl.value);
                        } else {
                            valueFilteredList = new Array(decl.value);
                        }

                        for (var value in valueFilteredList) {
                            valueFiltered = valueFilteredList[value];

                            if (onlyColor || !reCSSVariable.test(valueFiltered)) {
                                if (storePropsLink.indexOf(valueFiltered) === -1) {
                                    storePropsLink.push(valueFiltered);
                                }

                                extractValue(decl, storePropsLink, valueFiltered);
                            }
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
