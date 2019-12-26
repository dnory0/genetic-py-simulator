"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = require("path");
const distPython = child_process_1.exec(`pyinstaller --onefile --specpath ${path_1.join('app', 'python', 'spec', process.platform == 'linux' ? 'linux' : 'win')} --distpath ${path_1.join('app', 'python', 'dist', process.platform == 'linux' ? 'linux' : 'win')} --workpath ${path_1.join('app', 'python', 'build', process.platform == 'linux' ? 'linux' : 'win')} ${path_1.join('app', 'python', 'ga.py')}`);
distPython.stdout.pipe(process.stdout);
distPython.stderr.pipe(process.stderr);
//# sourceMappingURL=dist-python.js.map