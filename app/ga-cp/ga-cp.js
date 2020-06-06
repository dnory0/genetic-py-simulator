"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let ipcRenderer = window['ipcRenderer'];
let revertSettings = window['settings'];
let curSettings = JSON.parse(JSON.stringify(window['settings']));
delete window['settings'];
let isClosable = true;
let validatePath = window['validatePath'];
let checkPath = (path) => {
    let checkCode = validatePath(path, '.json', '.jsonc', '.js');
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
            console.log('path should point to a JSON file (ends with .json/.jsonc/.js).');
            break;
        default:
            console.log('possible.');
            break;
    }
};
let browseBtn = document.getElementById('browse-btn');
let loadBtn = document.getElementById('load-btn');
let paramsPath = document.getElementById('genes-data-path');
let saveBtn = document.getElementById('save-btn');
let closeBtn = document.getElementById('close-btn');
let revertBtn = document.getElementById('revert-btn');
browseBtn.onclick = () => {
    ipcRenderer.once('browsed-path', (_ev, result) => {
        if (result.canceled)
            return;
        paramsPath.value = result.filePaths[0];
    });
    ipcRenderer.send('browse');
};
paramsPath.addEventListener('keyup', (ev) => {
    if (ev.key == 'Enter')
        loadBtn.click();
});
loadBtn.onclick = () => checkPath(paramsPath.value);
(() => {
    saveBtn.onclick = () => {
        revertSettings['renderer']['input'] = curSettings['renderer']['input'];
        ipcRenderer.send('ga-cp-finished', curSettings);
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
        curSettings = revertSettings;
        affectSettings(revertSettings['renderer']['input'], 'ga-cp');
    };
    let eventListener = () => (revertBtn.disabled = saveBtn.disabled = isClosable = false);
    Array.from(document.getElementsByTagName('input')).forEach(input => {
        if (input.type == 'checkbox') {
            input.addEventListener('change', eventListener);
        }
        else if (input.type == 'radio') {
            input.addEventListener('change', eventListener);
        }
        else {
            input.addEventListener('keypress', eventListener);
            input.addEventListener('paste', eventListener);
            if (!input.id.match('genes-data-path'))
                input.addEventListener('keyup', ev => {
                    if (['ArrowUp', 'ArrowDown'].includes(ev.key))
                        eventListener();
                });
            if (input.classList.contains('textfieldable')) {
                input.addEventListener('change', eventListener);
            }
        }
    });
    Array.from(document.getElementsByClassName('random-btn')).forEach(randomBtn => randomBtn.addEventListener('click', eventListener));
})();
window['altTriggers']();
window['params']();
document.getElementById('random-all-btn').onclick = () => {
    Array.from(document.getElementsByClassName('random-btn')).forEach(randomBtn => {
        var param = randomBtn.parentElement.parentElement.parentElement;
        if (param.previousElementSibling && !param.previousElementSibling.checked)
            return;
        randomBtn.click();
    });
};
document.getElementById('force-tf-enabled').addEventListener('change', ev => {
    Array.from(document.getElementsByClassName('textfieldable')).forEach((textfieldable) => {
        textfieldable.type = ev.target.checked ? 'text' : 'range';
    });
});
let toggleDisableOnRun = (disable) => {
    (Array.from(document.getElementsByClassName('param-value')).map(paramValue => paramValue.firstElementChild)).forEach(gaParam => {
        if (!gaParam.classList.contains('disable-on-run'))
            return;
        curSettings['renderer']['input'][gaParam.id]['disable'] = disable;
        gaParam.disabled = disable;
        gaParam.parentElement.nextElementSibling.firstElementChild.disabled = disable;
        gaParam.parentElement.parentElement.title = !disable ? '' : 'Disabled when GA is Running';
    });
    let gaTypes = Array.from(document.getElementsByClassName('type-value'))
        .reduce((accum, typeValue) => accum.concat(...Array.from(typeValue.children)), [])
        .map((label) => label.firstElementChild)
        .filter(radioInput => radioInput.name != 'update_pop');
    curSettings['renderer']['input'][gaTypes[0].name.replace('_', '-')]['disable'] = disable;
    gaTypes.forEach(gaType => {
        gaType.disabled = disable;
        gaType.parentElement.parentElement.title = disable ? 'Disabled when GA is Running' : '';
    });
};
ipcRenderer.on('update-settings', (_ev, activate) => {
    toggleDisableOnRun(!activate);
});
ipcRenderer.on('close-confirm', () => {
    if (isClosable)
        ipcRenderer.send('ga-cp-finished');
    else
        ipcRenderer.send('close-confirm');
});
window['affectSettings'](curSettings['renderer']['input'], 'ga-cp');
window['saveSettings'](curSettings['renderer']['input']);
toggleDisableOnRun(curSettings['renderer']['input']['pop-size']['disable']);
window['border']();
//# sourceMappingURL=ga-cp.js.map