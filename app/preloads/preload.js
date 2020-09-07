"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
const { getGlobal } = electron_1.remote;
window['ipcRenderer'] = electron_1.ipcRenderer;
window['webFrame'] = electron_1.webFrame;
window['getGlobal'] = getGlobal;
window['ready'] = require(path_1.join(__dirname, '..', 'modules', 'ready.js'));
window['loaded'] = require(path_1.join(__dirname, '..', 'modules', 'loaded.js'));
window['border'] = require(path_1.join(__dirname, '..', 'modules', 'border.js'));
window['params'] = require('../modules/params');
window['specialParamsCases'] = require('../modules/special-param-cases');
window['affectSettings'] = require('../modules/affect-settings');
window['saveSettings'] = require('../modules/save-settings');
window['settings'] = getGlobal('settings');
window['isDev'] = getGlobal('isDev');
if (window['isDev'])
    window['k-shorts'] = require(path_1.join(__dirname, '..', 'modules', 'k-shorts.js'));
const pyshell = getGlobal('pyshell');
window['pyshell'] = pyshell;
window['sendSig'] = (signal) => pyshell.stdin.write(`${signal}\n`);
//# sourceMappingURL=preload.js.map