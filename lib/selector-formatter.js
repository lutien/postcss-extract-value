function selectorFormatter(selector) {
    return selector
        .replace(/^\.|^-|^#|\[|]|"|\)|$'/g, '')
        .replace(/\.|=|:|~|#|>|\(|\^|\+|,/g, '-')
        .replace(/[ \t]{2,}/g, ' ')
        .replace('*', 'all')
        .split(' ')
        .join('-')
        .replace(/-{2,}/g, '-')
        .replace(/^-/g, '');
}

module.exports = selectorFormatter;
