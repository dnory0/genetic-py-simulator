"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let ipcRenderer = window['ipcRenderer'];
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
let ffPath = document.getElementById('ff-path');
let saveBtn = document.getElementById('save-btn');
let cancelBtn = document.getElementById('cancel-btn');
let revertBtn = document.getElementById('revert-btn');
browseBtn.onclick = () => {
    ipcRenderer.once('browsed-path', (_ev, result) => {
        if (result.canceled)
            return;
        ffPath.value = result.filePaths[0];
        checkPath(result.filePaths[0]);
    });
    ipcRenderer.send('browse');
};
ffPath.onkeypress = () => checkPath(ffPath.value);
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
window.onkeydown = (ev) => {
    if (ev.key == 'Alt') {
        Array.from(document.getElementsByClassName('alt-trigger')).forEach((altTrigger) => {
            if (!altTrigger.parentElement.disabled)
                altTrigger.style.textDecoration = 'underline';
        });
    }
    else if (ev.altKey) {
        switch (ev.key) {
            case 's':
                if (!saveBtn.disabled)
                    saveBtn.classList.add('hover');
                break;
            case 'c':
                if (!cancelBtn.disabled)
                    cancelBtn.classList.add('hover');
                break;
            case 'r':
                if (!revertBtn.disabled)
                    revertBtn.classList.add('hover');
                break;
        }
    }
};
(() => {
    function altTriggered(button) {
        if (!button.disabled) {
            button.classList.remove('hover');
            button.click();
        }
    }
    window.onkeyup = (ev) => {
        if (ev.key == 'Alt') {
            Array.from(document.getElementsByClassName('alt-trigger')).forEach((altTrigger) => {
                if (!altTrigger.parentElement.disabled)
                    altTrigger.style.textDecoration = 'none';
            });
        }
        else if (ev.altKey) {
            switch (ev.key) {
                case 's':
                    altTriggered(saveBtn);
                    break;
                case 'c':
                    altTriggered(cancelBtn);
                    break;
                case 'r':
                    altTriggered(revertBtn);
                    break;
            }
        }
    };
})();
//# sourceMappingURL=conf-ga.js.map