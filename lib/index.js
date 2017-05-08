'use strict';

const postcss = require('postcss');
const colorObject = require('color-name');
const makeCSSVariable = require('./variable-templating');
const templateParser = require('./template-parser');

const colorList = {};
const colorNameList = Object.keys(colorObject);

colorNameList.forEach((key) => {
    colorList[key] = {
        r: colorObject[key][0],
        g: colorObject[key][1],
        b: colorObject[key][2],
    };
});

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

function addCSSVariable(variableSyntax, currentScope, value, prop) {
    if (variableSyntax) {
        currentScope.prepend({ prop, value });
    } else {
        currentScope.append({ prop, value });
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
    const templateMap = templateParser(templateVariableName);


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
                                    variableName = makeCSSVariable(templateMap, variablePrefix,
                                        variableSyntax, onlyColor, variablesListCounter, decl.prop, positionValue,
                                        filteredValue, rule);
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
            if (variableSyntax) {
                rootSel = root;
            } else {
                rootSel = postcss.rule({ selector: scope });
                root.prepend(rootSel);
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
