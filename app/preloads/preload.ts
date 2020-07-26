import { ChildProcess } from 'child_process';
import { ipcRenderer, webFrame, remote } from 'electron';
import { join } from 'path';
const { getGlobal } = remote;

/**
 * preloaded globally
 */
window['ipcRenderer'] = ipcRenderer;
/**
 * used to resize webviews
 */
window['webFrame'] = webFrame;
/**
 *
 */
window['getGlobal'] = getGlobal;
/*************************** Modules part ***************************/
/**
 * opens pyshell communication and returns webviews zoom factor resetter.
 */
window['ready'] = require(join(__dirname, '..', 'modules', 'ready.js'));
/**
 * removes loading background and shows the app interface.
 */
window['loaded'] = require(join(__dirname, '..', 'modules', 'loaded.js'));
/**
 * add resizabality for webviews and other parts of the UI
 */
window['border'] = require(join(__dirname, '..', 'modules', 'border.js'));
/**
 * parameters part
 */
window['params'] = require('../modules/params');
/**
 * special cases for param handling where instead of being duplicated around it was put in one file
 */
window['specialParamsCases'] = require('../modules/special-param-cases')
/**
 * settings affecter
 */
window['affectSettings'] = require('../modules/affect-settings');
/**
 * settings autosaver
 */
window['saveSettings'] = require('../modules/save-settings');

/**
 * loads app settings
 */
window['settings'] = getGlobal('settings');

/**
 * some keyboard shortcuts can't be implemented in the main process so they
 * are implemented in the renderer process
 */
window['isDev'] = getGlobal('isDev');
if (window['isDev'])
  window['k-shorts'] = require(join(__dirname, '..', 'modules', 'k-shorts.js'));

/*************************** Python part ***************************/
/**
 * python process responsible for executing genetic algorithm.
 */
const pyshell: ChildProcess = getGlobal('pyshell');
window['pyshell'] = pyshell;

/************************* states controller part *************************/
/**
 * send signal to GA
 * @param signal play | pause | stop | replay | step_f | exit
 */
window['sendSig'] = (signal: string) => pyshell.stdin.write(`${signal}\n`);
