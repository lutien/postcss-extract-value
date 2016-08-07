var postcss = require('postcss'),
    colorObject = require('color-name'),
    parserColor = require('parse-color'),
    nearestColor = require('nearest-color');

module.exports = postcss.plugin('postcss-extract-value', function (opts) {
    opts = opts || {};

    var colorNameList = Object.keys(colorObject);

    // Cache RegExp
    var reColorKeywords = new RegExp(colorNameList.join('|'));
    var reCSSVariable = /^var\(-{2}\w{1}[\w+-]*/;

    var reHex = /#(\w{6}|\w{3})/;
    var reRgb = /rgba?\([\d,.\s]+\)/;
    var reHsl = /hsla?\(\s?[0-9]{1,3},\s?([0-9]{1,3}%,?\s?){2}([0-9.]+)?\)/;

    var reExtract = new RegExp(reHex.source + '|' + reRgb.source + '|' +
        reHsl.source + '|' + reColorKeywords.source, 'g');


    // Options
    var filterByProps = opts.filterByProps,
        onlyColor = opts.onlyColor,
        scope = opts.scope || ':root',
        templateVariableName = opts.templateVariableName || '';

    var colorList = {};
    colorNameList.forEach(function (key) {
        colorList[key] = {
            r: colorObject[key][0],
            g: colorObject[key][1],
            b: colorObject[key][2]
        };
    });
    var findColor = nearestColor.from(colorList);
    var variablesListCounter = {};

    function isColor(value) {
        var reCheck =  new RegExp(/#\w+|rgba?|hsla?/.source +
            '|' + reColorKeywords.source, 'g');
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

    function colorNameVariable(value) {
        var variable = {},
            nearestColorValue = {},
            parsedColor = parserColor(value);

        if (parsedColor.hex) {
            nearestColorValue = parserColor(findColor(parsedColor.hex).value);
        }

        if (nearestColorValue) {
            variable.colorKeyword = nearestColorValue.keyword;

            if (templateVariableName.indexOf('[tint]') > -1) {
                if (nearestColorValue.hsl[2] > parsedColor.hsl[2]) variable.tint = 'dark';
                else if (nearestColorValue.hsl[2] < parsedColor.hsl[2]) variable.tint = 'light';
                else {
                    variable.tint = '';
                }

                if (variable.tint) {
                    if (templateVariableName.indexOf('[tint]') > 0) {
                        variable.tint = '-' + variable.tint;
                    }
                }
            }
            if (templateVariableName.indexOf('[colorKeyword]') > 0 &&
                !(templateVariableName.indexOf('[tint]') === 0 && !variable.tint)) {
                variable.colorKeyword = '-' + variable.colorKeyword;
            }
        }

        return variable;
    }

    function makeNameByTemplate(value, prop) {
        var nameVariables = [],
            result = templateVariableName;

        if (onlyColor) {
            nameVariables = colorNameVariable(value);
        } else if (templateVariableName.indexOf('[propertyName]')) {
            nameVariables.propertyName = prop;
        }
        for (var key in nameVariables) {
            result = result.replace('[' + key + ']', nameVariables[key]);
        }
        return result;
    }

    function makeCSSVariable(prop, num, value) {
        var variableName = '',
            result = '';

        if (templateVariableName) {
            variableName = makeNameByTemplate(value, prop);
            result = variableName;

            if (!variablesListCounter[variableName]) {
                variablesListCounter[variableName] = 1;
            }

            result += '-' + variablesListCounter[variableName];
            variablesListCounter[variableName]++;
        } else {
            variableName = prop + '-' + num;
            result = variableName;
        }

        return '--' + result;
    }

    function addCSSVariable(currentScope, value, variableName) {
        currentScope.append(variableName + ': ' + value);
    }

    return function (css) {
        var root = css.root(),
            rootSel,
            storeProps = {},
            checkColorFilter = true,
            checkPropFilter = true,
            filteredValueList = [],
            filteredValue = '',
            variableName = '',
            variablesList = {},
            positionValue = 0;

        css.walkRules(function (rule) {

            if (rule.selector === scope) {
                rootSel = rule;
            } else {
                rule.walkDecls(function (decl) {
                    if (!reCSSVariable.test(decl.value)) {

                        checkColorFilter = !onlyColor ||
                            onlyColor && isColor(decl.value);

                        checkPropFilter = !filterByProps ||
                            filterByProps &&
                            checkProp(filterByProps, decl.prop);

                        if (checkColorFilter && checkPropFilter) {

                            if (!storeProps[decl.prop]) {
                                storeProps[decl.prop] = [];
                            }

                            if (onlyColor) {
                                filteredValueList = extractColor(decl.value);
                            } else {
                                filteredValueList = new Array(decl.value);
                            }

                            for (var value in filteredValueList) {
                                filteredValue = filteredValueList[value];

                                positionValue = storeProps[decl.prop].indexOf(filteredValue);

                                if (positionValue === -1) {
                                    storeProps[decl.prop].push(filteredValue);
                                }
                                if (variablesList.hasOwnProperty(filteredValue)) {
                                    variableName = variablesList[filteredValue];
                                } else {
                                    positionValue = storeProps[decl.prop].indexOf(filteredValue);
                                    variableName = makeCSSVariable(decl.prop, ++positionValue, filteredValue);
                                    variablesList[filteredValue] = variableName;
                                }

                                decl.value = decl.value.replace(filteredValue, 'var(' + variableName + ')');
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
        for (var value in variablesList) {
            addCSSVariable(rootSel, value, variablesList[value]);
        }
    };
});
