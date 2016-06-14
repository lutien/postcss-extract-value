var postcss = require('postcss'),
    colorNameList = Object.keys(require('color-name'));

module.exports = postcss.plugin('postcss-extract-value', function (opts) {
    opts = opts || {};

    // Cache RegExp
    var reColorKeywords = new RegExp(colorNameList.join('|'));
    var reCheck =  new RegExp(/#\w+|rgba?|hsla?/.source +
        '|' + reColorKeywords.source, 'g');
    var reCSSVariable = /var\(-{2}\w{1}[\w+-]*/;
    var reHex = /#(\w{6}|\w{3})/;
    var reRgb = /rgba?\([\d,.\s]+\)/;
    var reHls = /hsla?\(\s?[0-9]{1,3},\s?(([0-9]{1,3})+%,\s?){2}[0-9.]+\s?\)/;
    var reExtract = new RegExp(reHex.source + '|' + reRgb.source + '|' +
        reHls.source + '|' + reColorKeywords.source, 'g');

    // Options
    var filterByProps = opts.filterByProps;
    var onlyColor = opts.onlyColor;
    var scope = opts.scope || ':root';

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

    function addCSSVariable(currentScope, prop, value, num) {
        currentScope.append(makeCSSVariable(prop, ++num) + ': ' + value);
    }

    function extractValue(decl, storePropsLink, valueFiltered) {
        var positionValue = storePropsLink.indexOf(valueFiltered) + 1;
        var variable = 'var(' + makeCSSVariable(decl.prop, positionValue) + ')';

        return decl.value.replace(valueFiltered, variable);
    }

    return function (css) {
        var root = css.root();
        var storeProps = {};
        var storePropsLink = {};
        var checkColorFilter = true;
        var checkPropFilter = true;
        var valueFilteredList = [];
        var valueFiltered = '';
        var rootSel = null;

        css.walkRules(function (rule) {

            if (rule.selector === scope) {
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

                                decl.value = extractValue(decl, storePropsLink, valueFiltered);
                            }
                        }
                    }
                });
            }
        });

        if (!rootSel) {
            rootSel = postcss.rule({ selector: scope });
            root.prepend(rootSel);
        }
        for (var prop in storeProps) {
            storeProps[prop].forEach(addCSSVariable.bind(this, rootSel, prop));
        }
    };
});
