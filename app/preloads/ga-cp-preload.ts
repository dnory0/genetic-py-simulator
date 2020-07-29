import { ipcRenderer, remote } from 'electron';

const { getGlobal } = remote;

window['ipcRenderer'] = ipcRenderer;

window['altTriggers'] = require('../modules/alt-triggers');

window['affectSettings'] = require('../modules/affect-settings');

window['saveSettings'] = require('../modules/save-settings');

window['border'] = require('../modules/border');

window['params'] = require('../modules/params');

window['validatePath'] = require('../modules/validate-path');

window['settings'] = getGlobal('settings');
/**
 * special cases for param handling where instead of being duplicated around it was put in one file
 */
window['specialParamsCases'] = require('../modules/special-param-cases')
