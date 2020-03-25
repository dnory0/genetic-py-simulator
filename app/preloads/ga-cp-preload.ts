import { ipcRenderer, remote } from 'electron';

const { getGlobal } = remote;

window['ipcRenderer'] = ipcRenderer;

window['altTriggers'] = require('../modules/alt-triggers');

window['affectSettings'] = require('../modules/affect-settings');

window['saveSettings'] = require('../modules/save-settings');

window['params'] = require('../modules/params');

window['validatePath'] = require('../modules/validate-path');

window['pyshell'] = getGlobal('pyshell');
