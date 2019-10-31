"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
window['ipcRenderer'] = electron_1.ipcRenderer;
window['webFrame'] = electron_1.webFrame;
window['isDev'] = electron_1.remote.app.getAppPath().indexOf('.asar') === -1;
const pyshell = require('./create-pyshell')(electron_1.remote.app);
window['pyshell'] = pyshell;
window['play'] = () => {
    pyshell.stdin.write(`play\n`);
};
window['pause'] = () => {
    pyshell.stdin.write(`pause\n`);
};
window['stop'] = () => {
    pyshell.stdin.write(`stop\n`);
};
window['replay'] = () => {
    pyshell.stdin.write(`replay\n`);
};
window['stepForward'] = () => {
    pyshell.stdin.write(`step_f\n`);
};
window['exit'] = () => {
    pyshell.stdin.write(`exit\n`);
};
//# sourceMappingURL=preload.js.map