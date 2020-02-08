import { spawn } from 'child_process';
import { join } from 'path';
import { copyFileSync } from 'fs';
import { App } from 'electron';

/**
 * initialize pyshell depending on the mode (development/production) and
 * platform (win32/linux)
 */
function createPyshell(app: App) {
  delete require.cache[require.resolve('./create-pyshell')];
  /**
   * the spawning of the ga.py can't be done if app is packaged.
   * It's blocked because it can't access the file content inside the asar file,
   * best solution is to copy the ga.py file to the tmp directory.
   */
  const isPackaged = app.getAppPath().indexOf('asar') != -1;
  if (!isPackaged)
    return spawn(`${process.platform == 'win32' ? 'python' : 'python3'}`, [
      join(__dirname, 'python', 'ga.py')
    ]);

  /**
   * original path of the python script
   */
  let copyFrom: string = join(__dirname, 'python', 'ga.py');
  /**
   * temp directory of the python script, the path it is going to be ```*copied*``` to
   */
  let copyTo: string = join(app.getPath('temp'), 'ga.py');

  copyFileSync(copyFrom, copyTo);

  return spawn(`${process.platform == 'win32' ? 'python' : 'python3'}`, [
    copyTo
  ]);
}

module.exports = createPyshell;
