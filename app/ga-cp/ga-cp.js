"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let ipcRenderer = window['ipcRenderer'];
let revertSettings;
let settings;
let isClosable = true;
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
let closeBtn = document.getElementById('close-btn');
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
paramsPath.onkeyup = () => checkPath(paramsPath.value);
(() => {
    saveBtn.onclick = () => {
        ipcRenderer.send('ga-cp-finished', settings);
    };
    closeBtn.onclick = () => {
        if (isClosable)
            ipcRenderer.send('ga-cp-finished');
        else
            ipcRenderer.send('close-confirm');
    };
    revertBtn.onclick = () => {
        revertBtn.disabled = true;
        saveBtn.disabled = true;
        isClosable = true;
        settings = revertSettings;
        affectSettings(revertSettings['renderer']['input'], 'ga-cp');
    };
    Array.from(document.getElementsByTagName('input')).forEach(input => {
        let eventListener = () => {
            revertBtn.disabled = false;
            saveBtn.disabled = false;
            isClosable = false;
        };
        if (input.type == 'checkbox')
            input.addEventListener('change', eventListener);
        else {
            input.addEventListener('keyup', eventListener);
            if (input.classList.contains('textfieldable'))
                input.addEventListener('change', eventListener);
        }
    });
})();
window['altTriggers']();
window['params']();
document.getElementById('random-all-btn').onclick = () => {
    (Array.from(document.getElementsByClassName('random-btn'))).forEach(randomBtn => {
        var param = randomBtn.parentElement.parentElement.parentElement;
        if (param.previousElementSibling &&
            !param.previousElementSibling.checked)
            return;
        randomBtn.click();
    });
};
document.getElementById('force-tf-enabled').addEventListener('change', ev => {
    Array.from(document.getElementsByClassName('textfieldable')).forEach((textfieldable) => {
        textfieldable.type = ev.target.checked
            ? 'text'
            : 'range';
    });
});
ipcRenderer.once('settings', (_ev, args) => {
    settings = args;
    revertSettings = JSON.parse(JSON.stringify(args));
    window['affectSettings'](settings['renderer']['input'], 'ga-cp');
    window['saveSettings'](settings['renderer']['input']);
});
ipcRenderer.send('settings');
ipcRenderer.on('close-confirm', () => {
    if (isClosable)
        ipcRenderer.send('ga-cp-finished');
    else
        ipcRenderer.send('close-confirm');
});
//# sourceMappingURL=ga-cp.js.map