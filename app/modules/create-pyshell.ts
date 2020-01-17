import { spawn } from 'child_process';
import { join } from 'path';
import { existsSync, copyFileSync } from 'fs';
import { App } from 'electron';

/**
 * initialize pyshell depending on the mode (development/production) and
 * platform (win32/linux)
 * @param app used to get paths
 */
function createPyshell(app: App) {
  delete require.cache[require.resolve('./create-pyshell')];
  /**
   * set to true if app on development, false in production.
   *
   * NOTE: app needs to be packed on asar (by default) to detect production mode
   * if you don't set asar to false on electron-builder.json you're good to go
   */
  const isDev = app.getAppPath().indexOf('.asar') === -1;
  // if in development
  if (isDev) {
    // works with the script version
    return spawn(`${process.platform == 'win32' ? 'python' : 'python3'}`, [
      join(__dirname, 'python', 'ga.py')
    ]);
  } else {
    /**
     * path of executable/script to copy
     */
    let copyFrom: string;
    /**
     * temp directory which the executable/script is going to be copied to
     */
    let copyTo: string;
    /**
     * set to true if executable is available
     */
    let execExist = existsSync(
      join(
        __dirname,
        'python',
        'dist',
        process.platform == 'win32'
          ? join('win', 'ga.exe')
          : join('linux', 'ga')
      )
    );

    if (execExist) {
      copyFrom = join(
        __dirname,
        'python',
        'dist',
        process.platform == 'win32'
          ? join('win', 'ga.exe')
          : join('linux', 'ga')
      );
      copyTo = join(
        app.getPath('temp'),
        process.platform == 'win32' ? 'ga.exe' : 'ga'
      );
    } else {
      copyFrom = join(__dirname, 'python', 'ga.py');
      copyTo = join(app.getPath('temp'), 'ga.py');
    }
    // works with the executable version
    copyFileSync(copyFrom, copyTo);
    return spawn(
      execExist
        ? copyTo
        : `${process.platform == 'win32' ? 'python' : 'python3'}`,
      execExist ? [] : [copyTo]
    );
  }
}

module.exports = createPyshell;
