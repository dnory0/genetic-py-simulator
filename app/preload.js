"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
window['ipcRenderer'] = electron_1.ipcRenderer;
window['webFrame'] = electron_1.webFrame;
window['isDev'] = electron_1.remote.app.getAppPath().indexOf('.asar') === -1;
const pyshell = require('./create-pyshell')(electron_1.remote.app);
window['pyshell'] = pyshell;
window['play'] = () => {
    pyshell.stdin.write(`${JSON.stringify({ play: true })}\n`);
};
window['pause'] = () => {
    pyshell.stdin.write(`${JSON.stringify({ pause: true })}\n`);
};
window['stop'] = () => {
    pyshell.stdin.write(`${JSON.stringify({ stop: true })}\n`);
};
window['replay'] = () => {
    pyshell.stdin.write(`${JSON.stringify({ replay: true })}\n`);
};
window['stepForward'] = () => {
    pyshell.stdin.write(`${JSON.stringify({ step_f: true })}\n`);
};
//# sourceMappingURL=preload.js.map