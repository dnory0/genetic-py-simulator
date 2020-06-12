"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
let ipcRenderer = window['ipcRenderer'];
let revertSettings = window['settings'];
let curSettings = JSON.parse(JSON.stringify(window['settings']));
delete window['settings'];
let isClosable = true;
let validatePath = window['validatePath'];
let browseBtns = Array.from(document.getElementsByClassName('browse-btn'));
let showOutputs = Array.from(document.getElementsByClassName('show-output-btn'));
let pathInputs = Array.from(document.getElementsByClassName('load-path'));
let saveBtn = document.getElementById('save-btn');
let closeBtn = document.getElementById('close-btn');
let revertBtn = document.getElementById('revert-btn');
browseBtns.forEach(function (browseBtn) {
    let type = browseBtn.classList.contains('genes-data') ? 'genes-data' : 'fitness-function';
    let pathInput = pathInputs.filter(pathInput => pathInput.classList.contains(type))[0];
    browseBtn.onclick = () => {
        ipcRenderer.once('browsed-path', (_ev, result) => {
            if (result.canceled)
                return;
            pathInput.value = result.filePaths[0];
            pathInput.dispatchEvent(new Event('browsedPath'));
        });
        ipcRenderer.send('browse', type == 'genes-data'
            ? {
                name: 'JSON File (.json)',
                extensions: ['json', 'jsonc', 'js'],
            }
            : {
                name: 'Python File (.py)',
                extensions: ['py', 'py3'],
            });
    };
});
let validateData = (pathInput, type) => __awaiter(void 0, void 0, void 0, function* () {
    return yield fetch(pathInput.value)
        .then(res => res.text())
        .then(data => {
        try {
            if (type == 'genes-data') {
                curSettings['renderer']['input'][pathInput.id]['data'] = JSON.parse(data);
            }
            return true;
        }
        catch (error) {
            if (type == 'genes-data') {
                alert(error);
                return false;
            }
        }
    });
});
let validatePathInput = (pathInput, type) => __awaiter(void 0, void 0, void 0, function* () {
    if (!pathInput.value)
        return;
    clearTimeout(pathInput['bgTimeout']);
    pathInput['bgTimeout'] = setTimeout(() => (pathInput.style.backgroundColor = ''), 1500);
    if (validatePath(pathInput.value, ...(type == 'genes-data' ? ['.json', '.jsonc', '.js'] : ['.py', '.py3'])) == 0 &&
        (yield validateData(pathInput, type))) {
        pathInput.style.backgroundColor = '#a8fba8';
        return true;
    }
    else {
        pathInput.style.backgroundColor = '#ffbfbf';
        return false;
    }
});
pathInputs.forEach(pathInput => {
    let type = pathInput.classList.contains('genes-data') ? 'genes-data' : 'fitness-function';
    pathInput.addEventListener('keyup', ev => {
        if (ev.key != 'Enter')
            return;
        validatePathInput(pathInput, type);
    });
});
showOutputs.forEach(showOutput => {
    let type = showOutput.classList.contains('genes-data') ? 'genes-data' : 'fitness-function';
    let pathInput = pathInputs.filter(pathInput => pathInput.classList.contains(type))[0];
    let treeContainer = document.querySelector('.genes-tree');
    showOutput.onclick = () => __awaiter(void 0, void 0, void 0, function* () {
        if (type == 'fitness-function') {
            alert('no python load for now');
            return;
        }
        if (validatePath(pathInput.value, ...(type == 'genes-data' ? ['.json', '.jsonc', '.js'] : ['.py', '.py3'])) == 0 &&
            (yield validateData(pathInput, type))) {
            Array.from(treeContainer.getElementsByClassName('json-container')).forEach(jsonContainer => jsonContainer.remove());
            window['jsonTree'](treeContainer, curSettings['renderer']['input'][pathInput.id]['data']);
            treeContainer.firstElementChild.classList.add('scrollbar');
        }
    });
});
(() => {
    saveBtn.onclick = () => ipcRenderer.send('ga-cp-finished', curSettings);
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
            if (input.classList.contains('load-path')) {
                input['isGACP'] = true;
                input.addEventListener('browsedPath', eventListener);
            }
            else {
                input.addEventListener('keyup', ev => {
                    if (['ArrowUp', 'ArrowDown'].includes(ev.key))
                        eventListener();
                });
                if (input.classList.contains('textfieldable')) {
                    input.addEventListener('change', eventListener);
                }
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