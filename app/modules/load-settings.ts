import { App } from 'electron';
import { join } from 'path';
import { writeFile, existsSync, readFile } from 'fs';

/**
 * loads the app settings, if not found, or corrupted, it will load
 * the default setting from app default installation direectory.
 *
 * @param app used to get the settings.json directory
 * @param fn a callback to execute after loading and parsing the settings
 */
function loadSettings(app: App, fn: (s: object) => void) {
  delete require.cache['./load-settings'];
  /**
   * global app settings, loaded when main window ready to show.
   */
  let Settingspath = join(app.getPath('userData'), 'settings.json');
  let resetSettings = () => {
    readFile(
      join(__dirname, '..', '..', 'settings.json'),
      { encoding: 'utf8' },
      (err: NodeJS.ErrnoException, data: string) => {
        if (err) throw err;
        fn(JSON.parse(data));
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
          fn(settings);
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
