// formatName.js — intentionally broken: wrong string template
function formatName(first, last) {
    var fullName = first + last; // BUG: missing space, also uses 'var' (lint error)
    return fullName;
}

module.exports = { formatName };
