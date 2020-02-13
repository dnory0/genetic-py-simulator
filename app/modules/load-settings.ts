import { writeFile, existsSync, readFile } from 'fs';

/**
 * loads the app settings, if not found, or corrupted, it will load
 * the default setting from app default installation direectory.
 *
 * @param settingsPath path to application settings
 * @param defSettingsPaththe default application settings path
 * @param fn a callback to execute after loading and parsing the settings
 */
function loadSettings(
  settingsPath: string,
  defSettingsPath: string,
  fn: (s: object) => void
) {
  delete require.cache['./load-settings'];
  let resetSettings = () => {
    readFile(
      defSettingsPath,
      { encoding: 'utf8' },
      (err: NodeJS.ErrnoException, data: string) => {
        if (err) throw err;
        fn(JSON.parse(data));
        writeFile(settingsPath, data, err => {
          if (err) throw err;
        });
      }
    );
  };
  if (existsSync(settingsPath)) {
    readFile(
      settingsPath,
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
