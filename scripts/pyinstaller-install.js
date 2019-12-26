"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const distPython = child_process_1.exec(`${process.platform == 'linux' ? 'python3' : 'python'} -m pip install pyinstaller --user`);
distPython.stdout.pipe(process.stdout);
distPython.stderr.pipe(process.stderr);
//# sourceMappingURL=pyinstaller-install.js.map