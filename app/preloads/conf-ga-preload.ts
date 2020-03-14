import { ipcRenderer } from 'electron';

window['ipcRenderer'] = ipcRenderer;

window['validatePath'] = require('../modules/validate-path');
