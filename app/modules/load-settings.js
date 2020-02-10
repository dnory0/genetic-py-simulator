"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs_1 = require("fs");
function loadSettings(app, fn) {
    delete require.cache['./load-settings'];
    let Settingspath = path_1.join(app.getPath('userData'), 'settings.json');
    let resetSettings = () => {
        fs_1.readFile(path_1.join(__dirname, '..', '..', 'settings.json'), { encoding: 'utf8' }, (err, data) => {
            if (err)
                throw err;
            fn(JSON.parse(data));
            fs_1.writeFile(Settingspath, data, err => {
                if (err)
                    throw err;
            });
        });
    };
    if (fs_1.existsSync(Settingspath)) {
        fs_1.readFile(Settingspath, { encoding: 'utf8' }, (err, data) => {
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