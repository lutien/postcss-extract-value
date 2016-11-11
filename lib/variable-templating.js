'use strict';

const parserColor = require('parse-color');
const nearestColor = require('nearest-color');
const colorObject = require('color-name');

const colorList = {};
const colorNameList = Object.keys(colorObject);

colorNameList.forEach((key) => {
    colorList[key] = {
        r: colorObject[key][0],
        g: colorObject[key][1],
        b: colorObject[key][2],
    };
});
const findColor = nearestColor.from(colorList);


function colorNameVariable(result, value) {
    let nearestColorValue = {};
    const parsedColor = parserColor(value);

    if (parsedColor.hex) {
        nearestColorValue = parserColor(findColor(parsedColor.hex).value);
    }

    if (nearestColorValue) {
        if (result.has('[colorKeyword]')) {
            result.set('[colorKeyword]', nearestColorValue.keyword);
        }

        if (result.has('[tint]')) {
            if (nearestColorValue.hsl[2] > parsedColor.hsl[2]) {
                result.set('[tint]', 'dark');
            } else if (nearestColorValue.hsl[2] < parsedColor.hsl[2]) {
                result.set('[tint]', 'light');
            } else {
                result.delete('[tint]');
            }
        }
    }

    return result;
}

function selectorFormatter(selector) {
    return selector
            .replace(/^\.|^-|#|:|\[|]|"|'/g, '')
            .replace(/\.|=|\+/g, '-')
            .replace(/[ \t]{2,}/g, ' ')
            .split(' ')
            .join('-')
            .replace(/-{2,}/g, '-');
}

function makeNameByTemplate(templateMap, onlyColor, value, prop, rule) {
    let result = new Map(templateMap);

    if (onlyColor) {
        result = colorNameVariable(result, value);
    } else if (templateMap.has('[propertyName]')) {
        result.set('[propertyName]', prop);
    }
    if (templateMap.has('[selectorName]')) {
        result.set('[selectorName]', selectorFormatter(rule.selector));
    }
    return result;
}

function addVariablePrefix(variablePrefix, variableSyntax, variable) {
    const prefix = variablePrefix[variableSyntax];
    return `${prefix || variablePrefix.default}${variable}`;
}

function makeCSSVariable(templateMap, variablePrefix, variableSyntax, onlyColor,
                         variablesListCounter, prop, num, value, rule) {
    let variableName = '';
    let result = new Map(templateMap);
    if (templateMap.size > 1) {
        result = makeNameByTemplate(templateMap, onlyColor, value, prop, rule);
        variableName = Array.from(result.values()).join('-');

        if (!variablesListCounter[variableName]) {
            variablesListCounter[variableName] = 1;
        }
        result.set('[number]', `${variablesListCounter[variableName]}`);
        result = Array.from(result.values()).join('-');

        variablesListCounter[variableName] += 1;
    } else {
        variableName = `${prop}-${num}`;
        result = variableName;
    }

    return addVariablePrefix(variablePrefix, variableSyntax, result);
}

module.exports = makeCSSVariable;
