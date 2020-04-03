import { existsSync, writeFileSync, readFileSync } from 'fs';

/**
 * loads the app settings, if not found, or corrupted, it will load
 * the default setting from app default installation direectory.
 *
 * @param settingsPath path to application settings
 * @param defSettingsPaththe default application settings path
 */

function loadSettings(settingsPath: string, defSettingsPath: string) {
  delete require.cache['./load-settings'];
  let loadedSettings: string;
  if (existsSync(settingsPath)) {
    try {
      return JSON.parse(readFileSync(settingsPath, { encoding: 'utf8' }));
    } catch (error) {}
  }
  // on a fresh installation or when settings file is deleted
  loadedSettings = readFileSync(defSettingsPath, {
    encoding: 'utf8'
  });
  writeFileSync(settingsPath, loadedSettings);
  return JSON.parse(loadedSettings);
}

module.exports = loadSettings;
