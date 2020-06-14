import { spawn } from 'child_process';
import { join } from 'path';
import { App } from 'electron';

/**
 * initializes pyshell
 */
function createPyshell(app: App) {
  delete require.cache[require.resolve('./create-pyshell')];
  /**
   * embedded python path in case of windows else calls python3 from terminal
   */
  let pyExecPath =
    process.platform == 'win32'
      ? join(app.getAppPath(), '..', 'build', 'python', 'win', `python-${process.arch}`, 'python.exe')
      : 'python3';
  /**
   * ga.py path, shipped with the build directory
   */
  let gaPath = join(app.getAppPath(), '..', 'build', 'python', 'ga.py');

  return spawn(pyExecPath, [gaPath]);
}

module.exports = createPyshell;
