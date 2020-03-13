import { ChildProcess } from 'child_process';
import { ipcRenderer, webFrame, remote } from 'electron';
import { join } from 'path';
const { app, getGlobal } = remote;

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
 * loads app settings
 */
require(join(__dirname, '..', 'modules', 'load-settings.js'))(
  join(app.getPath('userData'), 'settings.json'),
  join(__dirname, '..', '..', 'settings.json'),
  (settings: object) => {
    window['settings'] = settings;
  }
);

ipcRenderer.once('mode', (_ev, isDev: boolean) => {
  /**
   * some keyboard shortcuts can't be implemented in the main process so they
   * are implemented in the renderer process
   */
  if (isDev)
    window['k-shorts'] = require(join(
      __dirname,
      '..',
      'modules',
      'k-shorts.js'
    ));

  /*************************** Python part ***************************/
  /**
   * python process responsible for executing genetic algorithm.
   */
  const pyshell: ChildProcess = require(join(
    __dirname,
    '..',
    'modules',
    'create-pyshell.js'
  ))(app);
  window['pyshell'] = pyshell;

  /************************* states controller part *************************/
  /**
   * send signal to GA
   * @param signal play | pause | stop | replay | step_f | exit
   */
  window['sendSig'] = (signal: string) => pyshell.stdin.write(`${signal}\n`);
});
