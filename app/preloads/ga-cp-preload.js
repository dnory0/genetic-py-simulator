"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const { getGlobal } = electron_1.remote;
window['ipcRenderer'] = electron_1.ipcRenderer;
window['altTriggers'] = require('../modules/alt-triggers');
window['affectSettings'] = require('../modules/affect-settings');
window['saveSettings'] = require('../modules/save-settings');
window['params'] = require('../modules/params');
window['validatePath'] = require('../modules/validate-path');
window['pyshell'] = getGlobal('pyshell');
//# sourceMappingURL=ga-cp-preload.js.map