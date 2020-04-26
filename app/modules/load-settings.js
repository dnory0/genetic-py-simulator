"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
function loadSettings(app) {
    delete require.cache['./load-settings'];
    let settingsPath = path_1.join(app.getAppPath(), '..', app.isPackaged ? '..' : '.', 'settings.json');
    if (fs_1.existsSync(settingsPath)) {
        try {
            return JSON.parse(fs_1.readFileSync(settingsPath, { encoding: 'utf8' }));
        }
        catch (error) { }
    }
    let defaultSettingsPath = path_1.join(app.getAppPath(), '..', 'build', 'settings.json');
    return JSON.parse(fs_1.readFileSync(defaultSettingsPath, { encoding: 'utf8' }));
}
module.exports = loadSettings;
//# sourceMappingURL=load-settings.js.map