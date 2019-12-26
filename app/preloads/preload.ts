import { ChildProcess } from 'child_process';
import { ipcRenderer, webFrame, remote } from 'electron';
import { setFlagsFromString } from 'v8';
import { join } from 'path';

setFlagsFromString('--no-lazy');

/************************ Charts & Python Configuration ************************
 ******************************************************************************/
/**
 * preloaded globally
 */
window['ipcRenderer'] = ipcRenderer;
/**
 * used to resize webviews
 */
window['webFrame'] = webFrame;
/**
 * set to true if app on development, false in production.
 *
 * NOTE: app needs to be packed on asar (by default) to detect production mode.
 * if you don't set asar to false on electron-builder file it should work correctly.
 */
window['isDev'] = remote.app.getAppPath().indexOf('.asar') === -1;
/*************************** Modules part ***************************/
/**
 * add scroller auto maximizing & minimizing
 */
window['scrollbar'] = require(join(__dirname, '..', 'modules', 'scrollbar.js'));
/**
 * add resizabality parts of the UI
 */
window['border'] = require(join(__dirname, '..', 'modules', 'border.js'));

/*************************** Python part ***************************/
/**
 * python process responsible for executing genetic algorithm.
 */
const pyshell: ChildProcess = require(join(
  __dirname,
  '..',
  'modules',
  'create-pyshell.js'
))(remote.app);
window['pyshell'] = pyshell;

/************************* states controller part *************************/
/**
 * send signal to GA
 * @param signal play | pause | stop | replay | step_f | exit
 */
window['sendSig'] = (signal: string) => pyshell.stdin.write(`${signal}\n`);
