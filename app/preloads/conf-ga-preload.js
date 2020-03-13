"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const electron_1 = require("electron");
window['ipcRenderer'] = electron_1.ipcRenderer;
let isValidPath = (confGAPath) => fs_1.existsSync(confGAPath)
    ? path_1.isAbsolute(confGAPath)
        ? fs_1.statSync(confGAPath).isFile()
            ? path_1.extname(confGAPath) == '.py'
                ? 0
                : -4
            : -3
        : -2
    : -1;
window['isValidPath'] = isValidPath;
//# sourceMappingURL=conf-ga-preload.js.map