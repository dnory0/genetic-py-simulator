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
let pyshell = window['pyshell'];
let ipcRenderer = window['ipcRenderer'];
let revertSettings = window['settings'];
let curSettings = JSON.parse(JSON.stringify(window['settings']));
delete window['settings'];
(() => {
    const { toggleMutTypeDisable, toggleCOInputDisable } = window['specialParamsCases'];
    window['affectSettings'](curSettings['renderer']['input'], 'ga-cp', toggleCOInputDisable, toggleMutTypeDisable);
    window['saveSettings'](curSettings['renderer']['input'], 'ga-cp', toggleCOInputDisable, toggleMutTypeDisable);
})();
window['border']();
let isClosable = true;
let validatePath = window['validatePath'];
let browseBtns = Array.from(document.getElementsByClassName('browse-btn'));
let loadBtns = Array.from(document.getElementsByClassName('load-data-btn'));
let getTemplateBtn = document.getElementById('get-template-btn');
let pathInputs = Array.from(document.getElementsByClassName('load-path'));
let saveBtn = document.getElementById('save-btn');
let closeBtn = document.getElementById('close-btn');
let revertBtn = document.getElementById('revert-btn');
let clearTerminalBtn = document.getElementById('clear-terminal-btn');
browseBtns.forEach(function (browseBtn) {
    let type = browseBtn.classList.contains('genes-data') ? 'genes-data' : 'fitness-function';
    let pathInput = pathInputs.find(pathInput => pathInput.classList.contains(type));
    browseBtn.onclick = () => {
        ipcRenderer.once('browsed-path', (_ev, result) => {
            if (result.canceled)
                return;
            pathInput.value = result.filePaths[0];
            loadBtns.find(loadBtn => loadBtn.classList.contains(type)).click();
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
let validateData = (pathInput) => __awaiter(void 0, void 0, void 0, function* () {
    return yield fetch(pathInput.value)
        .then(res => res.text())
        .then(data => {
        curSettings['renderer']['input'][pathInput.id]['data'] = data;
        try {
            JSON.stringify(JSON.parse(data));
        }
        catch (e) {
            return false;
        }
        return true;
    });
});
let validatePathInput = (pathInput, type) => {
    clearTimeout(pathInput['bgTimeout']);
    pathInput['bgTimeout'] = setTimeout(() => (pathInput.style.backgroundColor = ''), 1500);
    if (type == 'genes-data')
        clearJSONOutput();
    curSettings['renderer']['input'][pathInput.id]['data'] = null;
    pathInput.dispatchEvent(new Event('browsedPath'));
    let extensions = type == 'genes-data' ? ['.json', '.jsonc', '.js'] : ['.py', '.py3'];
    if (validatePath(pathInput.value, ...extensions) == 0) {
        pathInput.style.backgroundColor = '#a8fba8';
        return true;
    }
    else {
        pathInput.style.backgroundColor = '#ffbfbf';
        return false;
    }
};
pathInputs.forEach(pathInput => {
    let type = pathInput.classList.contains('genes-data') ? 'genes-data' : 'fitness-function';
    pathInput.addEventListener('keyup', ev => {
        if (ev.key != 'Enter')
            return;
        validatePathInput(pathInput, type);
    });
    setTimeout(() => {
        if (curSettings['renderer']['input'][pathInput.id]['data'] == undefined) {
            let loadBtn = loadBtns.find(loadBtn => loadBtn.classList.contains(type));
            let browseBtn = browseBtns.find(browseBtn => browseBtn.classList.contains(type));
            let extensions = type == 'genes-data' ? ['.json', '.jsonc', '.js'] : ['.py', '.py3'];
            let flickerBtn = validatePath(pathInput.value, ...extensions) == 0 ? loadBtn : browseBtn;
            if (type == 'fitness-function' && flickerBtn == loadBtn)
                return;
            flickerBtn.classList.add('notice-me');
            setTimeout(() => flickerBtn.classList.add('notice-me-transition'), 0);
            setTimeout(() => flickerBtn.classList.add('fade-white'), 200);
            setTimeout(() => flickerBtn.classList.remove('fade-white'), 350);
            setTimeout(() => flickerBtn.classList.add('fade-white'), 550);
            setTimeout(() => flickerBtn.classList.remove('notice-me', 'fade-white', 'notice-me-transition'), 750);
        }
    });
});
let clearJSONOutput = () => {
    let treeContainer = document.querySelector('.genes-tree');
    Array.from(treeContainer.getElementsByClassName('json-container')).forEach(jsonContainer => jsonContainer.remove());
};
let clearTerminalOutput = () => (clearTerminalBtn.parentElement.nextElementSibling.innerHTML = '');
let loadBtnsPressed = false;
loadBtns.forEach(loadBtn => {
    let type = loadBtn.classList.contains('genes-data') ? 'genes-data' : 'fitness-function';
    let pathInput = pathInputs.find(pathInput => pathInput.classList.contains(type));
    let treeContainer = document.querySelector('.genes-tree');
    loadBtn.onclick = () => __awaiter(void 0, void 0, void 0, function* () {
        loadBtnsPressed = true;
        if (!validatePathInput(pathInput, type))
            return;
        if (type == 'fitness-function') {
            pyshell.stdin.write(JSON.stringify({
                test_user_code_path: pathInput.value,
            }) + '\n');
            return;
        }
        let validationResult = yield validateData(pathInput);
        pyshell.stdin.write(JSON.stringify({
            test_genes_data: curSettings['renderer']['input']['genes-data-path']['data'],
        }) + '\n');
        if (validationResult) {
            window['jsonTree'](treeContainer, curSettings['renderer']['input']['genes-data-path']['data']);
            treeContainer.firstElementChild.classList.add('scrollbar');
        }
    });
});
getTemplateBtn.onclick = () => {
    ipcRenderer.send('download-template', {
        name: 'Python File (.py)',
        extensions: ['py', 'py3'],
    });
};
(() => {
    saveBtn.onclick = () => ipcRenderer.send('ga-cp-finished', curSettings);
    closeBtn.onclick = () => {
        if (isClosable)
            ipcRenderer.send('ga-cp-finished');
        else
            ipcRenderer.send('close-confirm');
    };
    revertBtn.onclick = () => {
        clearJSONOutput();
        clearTerminalOutput();
        revertBtn.disabled = true;
        saveBtn.disabled = true;
        isClosable = true;
        curSettings = revertSettings;
        (() => {
            const { toggleMutTypeDisable, toggleCOInputDisable } = window['specialParamsCases'];
            affectSettings(revertSettings['renderer']['input'], 'ga-cp', toggleCOInputDisable, toggleMutTypeDisable);
        })();
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
            if (input.classList.contains('load-path')) {
                input.addEventListener('browsedPath', eventListener);
            }
            input.addEventListener('keypress', eventListener);
            input.addEventListener('paste', eventListener);
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
    clearTerminalBtn.addEventListener('click', clearTerminalOutput);
})();
window['altTriggers']();
window['params']();
document.getElementById('random-all-btn').onclick = () => {
    Array.from(document.getElementsByClassName('random-btn')).forEach(randomBtn => {
        const param = randomBtn.parentElement.parentElement.parentElement;
        if (param.previousElementSibling && !param.previousElementSibling.checked)
            return;
        randomBtn.click();
    });
};
document.getElementById('force-tf-enabled').addEventListener('change', ev => {
    Array.from(document.getElementsByClassName('textfieldable')).forEach((textfieldable) => {
        textfieldable['switchTextfieldable'](textfieldable, ev.target);
    });
});
let toggleDisableOnRun = (disable) => {
    Array.from(document.getElementsByClassName('param-value')).map(paramValue => {
        return paramValue.classList.contains('double-sync')
            ? paramValue.querySelector('.main-double-sync')
            : paramValue.firstElementChild;
    }).forEach(gaParam => {
        if (!gaParam.classList.contains('disable-on-run'))
            return;
        curSettings['renderer']['input'][gaParam.id]['disable'] = disable;
        gaParam.parentElement.parentElement.title = !disable ? '' : 'Disabled when GA is Running';
        gaParam.disabled = (gaParam.classList.contains('forced-disable') && gaParam.disabled) || disable;
        gaParam.parentElement.nextElementSibling.firstElementChild.disabled = disable;
        try {
            gaParam.parentElement.parentElement.parentElement.previousElementSibling.disabled = disable;
        }
        catch (e) { }
    });
    let gaTypes = Array.from(document.getElementsByClassName('type-value'))
        .reduce((accum, typeValue) => accum.concat(...Array.from(typeValue.children)), [])
        .map((label) => label.firstElementChild)
        .filter(radioInput => radioInput.name != 'update_pop');
    curSettings['renderer']['input'][gaTypes[0].name.replace('_', '-')]['disable'] = disable;
    gaTypes.forEach(gaType => {
        gaType.disabled = (gaType.classList.contains('forced-disable') && gaType.disabled) || disable;
        gaType.parentElement.parentElement.title = disable ? 'Disabled when GA is Running' : '';
    });
    pathInputs.forEach(pathInput => (pathInput.disabled = disable));
    browseBtns.forEach(browseBtns => (browseBtns.disabled = disable));
    loadBtns.forEach(loadBtn => (loadBtn.disabled = disable));
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
let terminal = clearTerminalBtn.parentElement.nextElementSibling;
let treatMessage = (data) => {
    if (!data || !data['terminal'])
        return;
    let line = document.createElement('div');
    line.classList.toggle(data['line-type'], true);
    line.innerHTML = `${['', null, undefined, []].includes(data['msg-type']) ? '' : data['msg-type'] + ': '}${data['message'] ? data['message'] : '&lt;message with no content&gt;'}`;
    terminal.appendChild(line);
};
pyshell.stdout.on('data', (chunk) => {
    if (loadBtnsPressed) {
        loadBtnsPressed = false;
        if (terminal.children.length) {
            treatMessage({
                terminal: true,
                message: '--------------------------------------------',
            });
        }
    }
    chunk
        .toString()
        .split(/(?<=\n)/g)
        .map((data) => {
        try {
            return JSON.parse(data);
        }
        catch (e) {
            treatMessage({
                terminal: true,
                'line-type': 'warning',
                'msg-type': 'WARNING',
                message: 'Detected uncontrolled output, your GA is not affected, but avoid using a print statement inside the imported python file, use to_terminal() provided with the template.',
            });
            return {};
        }
    })
        .forEach((data) => treatMessage(data));
});
pyshell.stderr.on('data', (chunk) => {
    console.error(chunk.toString());
});
toggleDisableOnRun(curSettings['renderer']['input']['pop-size']['disable']);
//# sourceMappingURL=ga-cp.js.map