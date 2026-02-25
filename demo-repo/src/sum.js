// sum.js — intentionally broken: uses wrong operator
function sum(a, b) {
    return a - b; // BUG: should be a + b
}

module.exports = { sum };
