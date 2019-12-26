"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const v8_1 = require("v8");
const path_1 = require("path");
v8_1.setFlagsFromString('--no-lazy');
window['ipcRenderer'] = electron_1.ipcRenderer;
window['webFrame'] = electron_1.webFrame;
window['isDev'] = electron_1.remote.app.getAppPath().indexOf('.asar') === -1;
window['scrollbar'] = require(path_1.join(__dirname, '..', 'modules', 'scrollbar.js'));
window['border'] = require(path_1.join(__dirname, '..', 'modules', 'border.js'));
const pyshell = require(path_1.join(__dirname, '..', 'modules', 'create-pyshell.js'))(electron_1.remote.app);
window['pyshell'] = pyshell;
window['sendSig'] = (signal) => pyshell.stdin.write(`${signal}\n`);
//# sourceMappingURL=preload.js.map