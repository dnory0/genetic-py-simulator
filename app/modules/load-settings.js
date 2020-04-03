"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
function loadSettings(settingsPath, defSettingsPath) {
    delete require.cache['./load-settings'];
    let loadedSettings;
    if (fs_1.existsSync(settingsPath)) {
        try {
            return JSON.parse(fs_1.readFileSync(settingsPath, { encoding: 'utf8' }));
        }
        catch (error) { }
    }
    loadedSettings = fs_1.readFileSync(defSettingsPath, {
        encoding: 'utf8'
    });
    fs_1.writeFileSync(settingsPath, loadedSettings);
    return JSON.parse(loadedSettings);
}
module.exports = loadSettings;
//# sourceMappingURL=load-settings.js.map