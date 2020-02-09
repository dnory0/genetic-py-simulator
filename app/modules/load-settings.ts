import { App, BrowserWindow } from 'electron';
import { join } from 'path';
import { writeFile, existsSync, readFile } from 'fs';

function loadSettings(app: App, mainWindow: BrowserWindow) {
  delete require.cache['./load-settings'];
  /**
   * global app settings, loaded when main window ready to show.
   */
  let Settingspath = join(app.getPath('userData'), 'settings.json');
  let resetSettings = () => {
    readFile(
      join(app.getAppPath(), '..', 'settings.json'),
      { encoding: 'utf8' },
      (err: NodeJS.ErrnoException, data: string) => {
        if (err) throw err;
        mainWindow.webContents.send('settings', JSON.parse(data));
        writeFile(Settingspath, data, err => {
          if (err) throw err;
        });
      }
    );
  };
  if (existsSync(Settingspath)) {
    readFile(
      Settingspath,
      { encoding: 'utf8' },
      (err: NodeJS.ErrnoException, data: string) => {
        if (err) throw err;
        try {
          let settings = JSON.parse(data);
          mainWindow.webContents.send('settings', settings);
        } catch (error) {
          // console.error(error);
          resetSettings(); // my guess is the settings file has a json syntax error (usualy when altered by user)
          // implement settings corrupted msg.
          // console.log('oops');
        }
      }
    );
  } else resetSettings(); // on a fresh installation or when file is deleted
}

module.exports = loadSettings;
