"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = require("path");
const fs_1 = require("fs");
function createPyshell(app) {
    delete require.cache[require.resolve('./create-pyshell')];
    const isPackaged = app.getAppPath().indexOf('asar') != -1;
    if (!isPackaged)
        return child_process_1.spawn(`${process.platform == 'win32' ? 'python' : 'python3'}`, [
            path_1.join(__dirname, 'python', 'ga.py')
        ]);
    let copyFrom = path_1.join(__dirname, 'python', 'ga.py');
    let copyTo = path_1.join(app.getPath('temp'), 'ga.py');
    fs_1.copyFileSync(copyFrom, copyTo);
    return child_process_1.spawn(`${process.platform == 'win32' ? 'python' : 'python3'}`, [
        copyTo
    ]);
}
module.exports = createPyshell;
//# sourceMappingURL=create-pyshell.js.map