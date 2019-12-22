"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = require("path");
const fs_1 = require("fs");
module.exports = (app) => {
    delete require.cache[require.resolve('./create-pyshell')];
    const isDev = app.getAppPath().indexOf('.asar') === -1;
    if (isDev) {
        return child_process_1.spawn(`${process.platform == 'win32' ? 'python' : 'python3'}`, [
            path_1.join(__dirname, 'python', 'ga.py')
        ]);
    }
    else {
        let copyFrom;
        let copyTo;
        let execExist = fs_1.existsSync(path_1.join(__dirname, 'python', 'dist', process.platform == 'win32'
            ? path_1.join('win', 'ga.exe')
            : path_1.join('linux', 'ga')));
        if (execExist) {
            copyFrom = path_1.join(__dirname, 'python', 'dist', process.platform == 'win32'
                ? path_1.join('win', 'ga.exe')
                : path_1.join('linux', 'ga'));
            copyTo = path_1.join(app.getPath('temp'), process.platform == 'win32' ? 'ga.exe' : 'ga');
        }
        else {
            copyFrom = path_1.join(__dirname, 'python', 'ga.py');
            copyTo = path_1.join(app.getPath('temp'), 'ga.py');
        }
        fs_1.copyFileSync(copyFrom, copyTo);
        return child_process_1.spawn(execExist
            ? copyTo
            : `${process.platform == 'win32' ? 'python' : 'python3'}`, execExist ? [] : [copyTo]);
    }
};
//# sourceMappingURL=create-pyshell.js.map