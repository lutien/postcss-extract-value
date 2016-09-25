'use strict';

const postcss = require('postcss');
const colorObject = require('color-name');
const parserColor = require('parse-color');
const nearestColor = require('nearest-color');

const colorList = {};

Object.keys(colorObject).forEach((key) => {
    colorList[key] = {
        r: colorObject[key][0],
        g: colorObject[key][1],
        b: colorObject[key][2],
    };
});
const findColor = nearestColor.from(colorList);

function checkProp(filter, prop) {
    return filter.indexOf(prop) > -1;
}

function isColor(reColorKeywords, value) {
    const reCheck = new RegExp(`${/#\w+|rgba?|hsla?/.source}|${reColorKeywords.source}`, 'g');
    return reCheck.test(value);
}

function extractColor(reExtract, value) {
    const resultArray = [];
    let result = reExtract.exec(value);

    while (result) {
        resultArray.push(result[0]);
        result = reExtract.exec(value);
    }
    return resultArray;
}

function colorNameVariable(templateVariableName, value) {
    const variable = {};
    let nearestColorValue = {};
    const parsedColor = parserColor(value);

    if (parsedColor.hex) {
        nearestColorValue = parserColor(findColor(parsedColor.hex).value);
    }

    if (nearestColorValue) {
        variable.colorKeyword = nearestColorValue.keyword;

        if (templateVariableName.indexOf('[tint]') > -1) {
            if (nearestColorValue.hsl[2] > parsedColor.hsl[2]) {
                variable.tint = 'dark';
            } else if (nearestColorValue.hsl[2] < parsedColor.hsl[2]) {
                variable.tint = 'light';
            } else {
                variable.tint = '';
            }

            if (variable.tint) {
                if (templateVariableName.indexOf('[tint]') > 0) {
                    variable.tint = `-${variable.tint}`;
                }
            }
        }
        if (templateVariableName.indexOf('[colorKeyword]') > 0 &&
            !(templateVariableName.indexOf('[tint]') === 0 &&
            !variable.tint)) {
            variable.colorKeyword = `-${variable.colorKeyword}`;
        }
    }

    return variable;
}

function makeNameByTemplate(templateVariableName, onlyColor, value, prop) {
    let nameVariables = [];
    let result = templateVariableName;

    if (onlyColor) {
        nameVariables = colorNameVariable(templateVariableName, value);
    } else if (templateVariableName.indexOf('[propertyName]')) {
        nameVariables.propertyName = prop;
    }
    Object.keys(nameVariables).forEach((key) => {
        result = result.replace(`[${key}]`, nameVariables[key]);
    });
    return result;
}

function addVariablePrefix(variablePrefix, variableSyntax, variable) {
    const prefix = variablePrefix[variableSyntax];
    return `${prefix || variablePrefix.default}${variable}`;
}

function makeCSSVariable(templateVariableName, variablePrefix, variableSyntax, onlyColor,
                         variablesListCounter, prop, num, value) {
    let variableName = '';
    let result = '';

    if (templateVariableName) {
        variableName = makeNameByTemplate(templateVariableName, onlyColor, value, prop);
        result = variableName;

        if (!variablesListCounter[variableName]) {
            variablesListCounter[variableName] = 1;
        }

        result += `-${variablesListCounter[variableName]}`;
        variablesListCounter[variableName] += 1;
    } else {
        variableName = `${prop}-${num}`;
        result = variableName;
    }

    return addVariablePrefix(variablePrefix, variableSyntax, result);
}

function addCSSVariable(variableSyntax, currentScope, value, variableName) {
    if (variableSyntax) {
        currentScope.prepend(`${variableName}: ${value}`);
    } else {
        currentScope.append(`${variableName}: ${value}`);
    }
}

function hasVariable(variableSyntax, reCSSVariable, value) {
    const reTest = reCSSVariable[variableSyntax] || reCSSVariable.default;
    return reTest.test(value);
}

module.exports = postcss.plugin('postcss-extract-value', (opts) => {
    // Fix for Node 4
    const params = opts || {};

    // Options
    const filterByProps = params.filterByProps;
    const onlyColor = params.onlyColor;
    const scope = params.scope || ':root';
    const templateVariableName = params.templateVariableName || '';
    const variableSyntax = params.variableSyntax || '';


    const variablePrefix = {
        default: '--',
        less: '@',
        sass: '$',
    };

    const variablesListCounter = {};

    // Cache RegExp
    const reColorKeywords = new RegExp(colorNameList.join('|'));
    const reCSSVariable = {
        default: /^var\(-{2}\w{1}[\w+-]*/,
        sass: /\$\w{1}[\w+-]*/,
        less: /@\w{1}[\w+-]*/,
    };
    const reHex = /#(\w{6}|\w{3})/;
    const reRgb = /rgba?\([\d,.\s]+\)/;
    const reHsl = /hsla?\(\s?[0-9]{1,3},\s?([0-9]{1,3}%,?\s?){2}([0-9.]+)?\)/;
    const reExtract = new RegExp(`${reHex.source}|${reRgb.source}|${reHsl.source}|${reColorKeywords.source}`, 'g');

    return function parser(css) {
        const root = css.root();
        let rootSel = {};
        const storeProps = {};
        let checkColorFilter = true;
        let checkPropFilter = true;
        let filteredValueList = [];
        let variableName = '';
        const variablesList = {};
        let positionValue = 0;

        css.walkRules((rule) => {
            if (rule.selector === scope) {
                rootSel = rule;
            } else {
                rule.walkDecls((decl) => {
                    if (!hasVariable(variableSyntax, reCSSVariable, decl.value)) {
                        checkColorFilter = !onlyColor || onlyColor
                            && isColor(reColorKeywords, decl.value);

                        checkPropFilter = (!filterByProps || filterByProps
                            && checkProp(filterByProps, decl.prop));

                        if (checkColorFilter && checkPropFilter) {
                            if (!storeProps[decl.prop]) {
                                storeProps[decl.prop] = [];
                            }

                            if (onlyColor) {
                                filteredValueList = extractColor(reExtract, decl.value);
                            } else {
                                filteredValueList = new Array(decl.value);
                            }

                            filteredValueList.forEach((filteredValue) => {
                                positionValue = storeProps[decl.prop].indexOf(filteredValue);

                                if (positionValue === -1) {
                                    storeProps[decl.prop].push(filteredValue);
                                }
                                if ({}.hasOwnProperty.call(variablesList, filteredValue)) {
                                    variableName = variablesList[filteredValue];
                                } else {
                                    positionValue = storeProps[decl.prop].indexOf(filteredValue) + 1;
                                    variableName = makeCSSVariable(templateVariableName, variablePrefix,
                                        variableSyntax, onlyColor, variablesListCounter, decl.prop, positionValue,
                                        filteredValue);
                                    variablesList[filteredValue] = variableName;
                                }
                                if (variableSyntax) {
                                    decl.value = decl.value.replace(filteredValue,
                                        `${variableName}`);
                                } else {
                                    decl.value = decl.value.replace(filteredValue,
                                        `var(${variableName})`);
                                }
                            });
                        }
                    }
                });
            }
        });

        if (Object.keys(rootSel).length === 0) {
            if (!variableSyntax) {
                rootSel = postcss.rule({ selector: scope });
                root.prepend(rootSel);
            } else {
                rootSel = root;
            }
        }

        const varialbleListKeys = Object.keys(variablesList);
        if (variableSyntax) {
            varialbleListKeys.reverse();
        }

        varialbleListKeys.forEach((value) => {
            addCSSVariable(variableSyntax, rootSel, value, variablesList[value]);
        });
    };
});
