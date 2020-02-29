"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
require(path_1.join(__dirname, 'chart-preload'));
window['sync-charts'] = () => require(path_1.join(__dirname, '..', 'modules', 'sync-charts'));
//# sourceMappingURL=side-preload.js.map