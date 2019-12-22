"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
window['ipcRenderer'] = electron_1.ipcRenderer;
window['webFrame'] = electron_1.webFrame;
window['isDev'] = electron_1.remote.app.getAppPath().indexOf('.asar') === -1;
window['scrollbar'] = require('../modules/scrollbar');
window['border'] = require('../modules/border');
const pyshell = require('../modules/create-pyshell')(electron_1.remote.app);
window['pyshell'] = pyshell;
window['sendSig'] = (signal) => pyshell.stdin.write(`${signal}\n`);
//# sourceMappingURL=preload.js.map