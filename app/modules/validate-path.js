"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
function validatePath(filePath, ...exts) {
    return fs_1.existsSync(filePath)
        ? path_1.isAbsolute(filePath)
            ? fs_1.statSync(filePath).isFile()
                ? exts.includes(path_1.extname(filePath).toLowerCase())
                    ? 0
                    : -4
                : -3
            : -2
        : -1;
}
module.exports = validatePath;
//# sourceMappingURL=validate-path.js.map