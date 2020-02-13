"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const child_process_1 = require("child_process");
const appDir = path_1.join(__dirname, '..');
child_process_1.exec(`dir ${path_1.join(appDir, 'main', '*.js')} ${path_1.join(appDir, 'main', '**', '*.js')}`, (_error, output) => {
    const elecBuilder = child_process_1.exec(`${path_1.join(appDir, 'node_modules', '.bin', 'electron-builder')} ${process.platform == 'linux'
        ? '-l'
        : process.platform == 'darwin'
            ? '-m'
            : '-w'} --x64`);
    elecBuilder.stdout.pipe(process.stdout);
    elecBuilder.stderr.pipe(process.stderr);
}).stderr.pipe(process.stderr);
//# sourceMappingURL=dist.js.map