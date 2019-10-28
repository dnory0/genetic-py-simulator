import { ChildProcess } from 'child_process';
import { ipcRenderer, webFrame, remote } from 'electron';

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
 * NOTE: app needs to be packed on asar (by default) to detect production mode
 * if you don't set asar to false on electron-builder.json you're good to go
 */
window['isDev'] = remote.app.getAppPath().indexOf('.asar') === -1;

/*************************** Python part ***************************/
const pyshell: ChildProcess = require('./create-pyshell')(remote.app);
window['pyshell'] = pyshell;

/************************* states controller part *************************/
/**
 * send play to GA, python side is responsible for whether to start GA for first time are just resume
 */
window['play'] = () => {
  pyshell.stdin.write(`${JSON.stringify({ play: true })}\n`);
};

/**
 * send pause to GA
 */
window['pause'] = () => {
  pyshell.stdin.write(`${JSON.stringify({ pause: true })}\n`);
};

/**
 * send stop to GA
 */
window['stop'] = () => {
  pyshell.stdin.write(`${JSON.stringify({ stop: true })}\n`);
};

/**
 * stops current GA and launches new one
 */
window['replay'] = () => {
  pyshell.stdin.write(`${JSON.stringify({ replay: true })}\n`);
};

/**
 * send step forward to GA, pyshell pauses GA if needed
 */
window['stepForward'] = () => {
  pyshell.stdin.write(`${JSON.stringify({ step_f: true })}\n`);
};
