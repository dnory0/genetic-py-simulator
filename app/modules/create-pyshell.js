"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = require("path");
function createPyshell(app) {
    delete require.cache[require.resolve('./create-pyshell')];
    let pyExecPath = process.platform == 'win32' ?
        path_1.join(app.getAppPath(), '..', 'build', 'python', 'win', `python-${process.arch}`, 'python.exe')
        : 'python3';
    let gaPath = path_1.join(app.getAppPath(), '..', 'build', 'python', 'ga.py');
    return child_process_1.spawn(pyExecPath, [gaPath]);
}
module.exports = createPyshell;
//# sourceMappingURL=create-pyshell.js.map