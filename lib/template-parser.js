/* const specialWords = [
    '[colorKeyword]',
    '[tint]',
    '[propertyName]',
]; */

function templateParser(template) {
    const arrLetters = template.split('');
    const templateMap = new Map();
    let str = '';

    arrLetters.forEach((letter) => {
        if (letter === '[') {
            if (str) {
                templateMap.set(str, str);
            }
            str = letter;
        } else if (letter === ']') {
            str += letter;
            templateMap.set(str, str);
            str = '';
        } else {
            str += letter;
        }
    });

    if (str) {
        templateMap.set(str, str);
    }
    templateMap.set('[number]', '[number]');
    return templateMap;
}

module.exports = templateParser;
