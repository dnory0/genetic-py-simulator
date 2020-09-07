"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const { getGlobal } = electron_1.remote;
window['pyshell'] = getGlobal('pyshell');
window['ipcRenderer'] = electron_1.ipcRenderer;
window['altTriggers'] = require('../modules/alt-triggers');
window['affectSettings'] = require('../modules/affect-settings');
window['saveSettings'] = require('../modules/save-settings');
window['border'] = require('../modules/border');
window['params'] = require('../modules/params');
window['validatePath'] = require('../modules/validate-path');
window['settings'] = getGlobal('settings');
window['specialParamsCases'] = require('../modules/special-param-cases');
//# sourceMappingURL=ga-cp-preload.js.map