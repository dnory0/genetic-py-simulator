"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
function loadSettings(settingsPath, defSettingsPath, fn) {
    delete require.cache['./load-settings'];
    let resetSettings = () => {
        fs_1.readFile(defSettingsPath, { encoding: 'utf8' }, (err, data) => {
            if (err)
                throw err;
            fn(JSON.parse(data));
            fs_1.writeFile(settingsPath, data, err => {
                if (err)
                    throw err;
            });
        });
    };
    if (fs_1.existsSync(settingsPath)) {
        fs_1.readFile(settingsPath, { encoding: 'utf8' }, (err, data) => {
            if (err)
                throw err;
            try {
                let settings = JSON.parse(data);
                fn(settings);
            }
            catch (error) {
                resetSettings();
            }
        });
    }
    else
        resetSettings();
}
module.exports = loadSettings;
//# sourceMappingURL=load-settings.js.map