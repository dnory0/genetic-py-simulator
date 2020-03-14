"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
let validatePath = (confGAPath, ext = '.py') => fs_1.existsSync(confGAPath)
    ? path_1.isAbsolute(confGAPath)
        ? fs_1.statSync(confGAPath).isFile()
            ? path_1.extname(confGAPath).toLowerCase() == ext
                ? 0
                : -4
            : -3
        : -2
    : -1;
module.exports = validatePath;
//# sourceMappingURL=validate-path.js.map