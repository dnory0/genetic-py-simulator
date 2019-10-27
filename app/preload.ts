import { ChildProcess } from 'child_process';
import { ipcRenderer, webFrame, remote } from 'electron';

/************************ Charts & Python Configuration ************************
 ******************************************************************************/
/**
 * preloaded globally
 */
window['ipcRenderer'] = ipcRenderer;

window['webFrame'] = webFrame;

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
