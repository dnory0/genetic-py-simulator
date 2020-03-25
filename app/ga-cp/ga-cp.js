"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let ipcRenderer = window['ipcRenderer'];
let settings;
let validatePath = window['validatePath'];
let checkPath = (path) => {
    let checkCode = validatePath(path);
    switch (checkCode) {
        case -1:
            console.log("path doesn't exist.");
            break;
        case -2:
            console.log('path should be absolute, found relative path.');
            break;
        case -3:
            console.log("the path doesn't point to a file.");
            break;
        case -4:
            console.log('path should point to a python file (ends with .py).');
            break;
        default:
            console.log('possible.');
            break;
    }
};
let browseBtn = document.getElementById('browse-btn');
let paramsPath = document.getElementById('params-path');
let saveBtn = document.getElementById('save-btn');
let cancelBtn = document.getElementById('cancel-btn');
let revertBtn = document.getElementById('revert-btn');
browseBtn.onclick = () => {
    ipcRenderer.once('browsed-path', (_ev, result) => {
        if (result.canceled)
            return;
        paramsPath.value = result.filePaths[0];
        checkPath(result.filePaths[0]);
    });
    ipcRenderer.send('browse');
};
paramsPath.onkeypress = () => checkPath(paramsPath.value);
(() => {
    function saveConfig() {
        console.log('save triggered');
    }
    saveBtn.onclick = () => {
        saveConfig();
    };
})();
cancelBtn.onclick = () => {
    console.log('cancel triggered');
};
revertBtn.onclick = () => {
    console.log('revert triggered');
};
window['altTriggers']();
window['params']();
document.getElementById('random-all-btn').onclick = () => {
    (Array.from(document.getElementsByClassName('random-btn'))).forEach(randomBtn => {
        var param = randomBtn.parentElement.parentElement.parentElement;
        if (param.parentElement.classList.contains('complex-param') &&
            !param.previousElementSibling.checked)
            return;
        randomBtn.click();
    });
};
document.getElementById('force-textfields').addEventListener('change', ev => {
    Array.from(document.getElementsByClassName('textfieldable')).forEach((textfieldable) => {
        textfieldable.type = ev.target.checked
            ? 'text'
            : 'range';
    });
});
ipcRenderer.once('settings', (_ev, args) => {
    settings = args;
    window['affectSettings'](settings['renderer']['input']);
    window['saveSettings'](settings['renderer']['input']);
});
ipcRenderer.send('settings');
//# sourceMappingURL=ga-cp.js.map