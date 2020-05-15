"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
function validatePath(gaConfigPath, ...ext) {
    return fs_1.existsSync(gaConfigPath)
        ? path_1.isAbsolute(gaConfigPath)
            ? fs_1.statSync(gaConfigPath).isFile()
                ? ext.includes(path_1.extname(gaConfigPath).toLowerCase())
                    ? 0
                    : -4
                : -3
            : -2
        : -1;
}
module.exports = validatePath;
//# sourceMappingURL=validate-path.js.map