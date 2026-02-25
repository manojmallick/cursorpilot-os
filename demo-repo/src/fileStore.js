// fileStore.js — intentionally broken: has lint issues
function readData(filePath) {
    var data = filePath; // BUG: uses 'var' (lint: no-var)
    var unused = 42;     // BUG: unused variable (lint: no-unused-vars)
    if (data == null) {  // BUG: uses == instead of === (lint: eqeqeq)
        return 'default';
    }
    return data;
}

module.exports = { readData };
