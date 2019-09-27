"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = require("path");
const genPy = child_process_1.spawn("electron", ["."], {
    cwd: path_1.join(__dirname, ".."),
    detached: true,
    stdio: "ignore"
});
genPy.unref();
//# sourceMappingURL=index.js.map