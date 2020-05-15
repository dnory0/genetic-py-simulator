import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { App } from 'electron';

/**
 * loads the app settings, if not found, or corrupted, it will load
 * the default setting from app default installation directory.
 */
function loadSettings(app: App) {
  delete require.cache['./load-settings'];
  let settingsPath = join(app.isPackaged ? app.getPath('userData') : join(app.getAppPath(), '..'), 'settings.json');
  if (existsSync(settingsPath)) {
    try {
      return JSON.parse(readFileSync(settingsPath, { encoding: 'utf8' }));
    } catch (error) {}
  }
  // on a fresh installation or when settings file is deleted or corrupted, default settings are loaded
  let defaultSettingsPath = join(app.getAppPath(), '..', 'build', 'settings.json');
  return JSON.parse(readFileSync(defaultSettingsPath, { encoding: 'utf8' }));
}

module.exports = loadSettings;
