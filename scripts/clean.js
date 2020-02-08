"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = require("path");
const appDir = path_1.join(__dirname, '..');
if (process.platform == 'linux')
    child_process_1.exec(' ps -e | grep genetic-py', (_err, output) => {
        if (!output)
            return;
        output
            .split(/(?<=\n\r?)/)
            .map((process) => process.match(/[0-9]{1,5}/))
            .forEach(pid => setTimeout(() => child_process_1.exec(`kill ${pid.toLocaleString()}`)));
    }).stderr.pipe(process.stderr);
child_process_1.exec(`rm ${path_1.join(appDir, 'dist')} -r`).stderr.pipe(process.stderr);
//# sourceMappingURL=clean.js.map