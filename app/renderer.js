"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let ipcRenderer = window['ipcRenderer'];
delete window['ipcRenderer'];
let webFrame = window['webFrame'];
delete window['webFrame'];
const prime = document.getElementById('prime-chart');
const side = document.getElementById('side-chart');
let playBtn = document.getElementById('play-btn');
let stopBtn = document.getElementById('stop-btn');
let toStartBtn = document.getElementById('to-start-btn');
let stepFBtn = document.getElementById('step-forward-btn');
let lRSwitch = document.getElementById('lr-enabled');
let gaCPBtn = document.getElementById('ga-cp-btn');
let gaParams = (Array.from(document.getElementsByClassName('param-value')).map(paramValue => paramValue.firstElementChild));
let gaTypes = Array.from(document.getElementsByClassName('type-value'))
    .reduce((accum, typeValue) => accum.concat(...Array.from(typeValue.children)), [])
    .map((label) => label.firstElementChild)
    .concat(...Array.from(document.getElementsByName('update_pop')));
let settings = window['settings'];
let isRunning = false;
let isGACPOpen = false;
let toggleDisableOnRun = (activate = true) => {
    gaParams.forEach(gaParam => {
        if (!gaParam.classList.contains('disable-on-run'))
            return;
        settings['renderer']['input'][gaParam.id]['disable'] = !activate;
        gaParam.disabled = !activate;
        gaParam.parentElement.nextElementSibling.firstElementChild.disabled = !activate;
        gaParam.parentElement.parentElement.title = activate ? '' : 'Disabled when GA is Running';
    });
    settings['renderer']['input'][gaTypes[0].name.replace('_', '-')]['disable'] = !activate;
    gaTypes.forEach(gaType => {
        if (gaType.name == 'update_pop')
            return;
        gaType.disabled = !activate;
        gaType.parentElement.parentElement.title = activate ? '' : 'Disabled when GA is Running';
    });
    if (activate && isGACPOpen)
        ipcRenderer.send('ga-cp', activate);
};
const treatResponse = (response) => {
    if (response['started']) {
        toggleDisableOnRun(false);
        setClickable();
    }
    else if (response['finished']) {
        isRunning = false;
        setClickable(isRunning);
        blinkPlayBtn();
        toggleDisableOnRun(true);
        switchPlayBtn();
    }
    else if (response['forced-pause']) {
        isRunning = false;
        blinkPlayBtn();
        switchPlayBtn();
    }
};
const switchPlayBtn = () => {
    playBtn.querySelector('.play').classList.toggle('hide', isRunning);
    playBtn.querySelector('.pause').classList.toggle('hide', !isRunning);
};
const setClickable = (clickable = true) => {
    Array.from(document.querySelector('.state-controls').children).forEach((element, index) => {
        if ([0, 4].includes(index))
            return;
        if (clickable)
            element.classList.remove('disabled-btn');
        else
            element.classList.add('disabled-btn');
        element.disabled = !clickable;
    });
};
const blinkPlayBtn = () => {
    playBtn.classList.add('disabled-btn');
    playBtn.disabled = true;
    setTimeout(() => {
        playBtn.classList.remove('disabled-btn');
        playBtn.disabled = false;
    }, 400);
};
let zoomViews = () => { };
const ctrlClicked = (signal, goingToRun) => {
    if (signal == 'step_f')
        prime.send('step-forward');
    if (signal == 'replay')
        prime.send('replay');
    if (signal == 'stop') {
        setClickable(goingToRun);
        toggleDisableOnRun(true);
    }
    window['sendSig'](signal);
    isRunning = goingToRun;
    switchPlayBtn();
};
playBtn.onclick = () => ctrlClicked(isRunning ? 'pause' : 'play', !isRunning);
stopBtn.onclick = () => ctrlClicked('stop', false);
toStartBtn.onclick = () => ctrlClicked('replay', true);
stepFBtn.onclick = () => ctrlClicked('step_f', false);
(() => {
    function toggleFullscreen(fscreenBtn) {
        if (document.fullscreenElement)
            document.exitFullscreen();
        else
            fscreenBtn.parentElement.parentElement.requestFullscreen();
    }
    Array.from(document.getElementsByClassName('fscreen-btn')).forEach((fscreenBtn) => {
        fscreenBtn.onclick = () => toggleFullscreen(fscreenBtn);
    });
    let clean = (eventListener) => {
        Array.from(document.getElementsByClassName('resize-cover')).forEach((resizeCover) => {
            resizeCover.classList.add('hide');
        });
        window.removeEventListener('click', eventListener);
    };
    Array.from(document.getElementsByClassName('drop-btn')).forEach((exportBtn) => {
        let dropdownContent = exportBtn.nextElementSibling;
        let dropdownPointer = dropdownContent.nextElementSibling;
        let exportTypes = Array.from(dropdownContent.children);
        let eventListener = () => {
            dropdownPointer.classList.toggle('hide', true);
            dropdownContent.classList.toggle('hide', true);
            clean(eventListener);
        };
        exportBtn.addEventListener('click', () => {
            dropdownPointer.classList.toggle('hide');
            dropdownContent.classList.toggle('hide');
            Array.from(document.getElementsByClassName('resize-cover')).forEach((resizeCover) => {
                resizeCover.classList.remove('hide');
            });
            if (dropdownContent.classList.contains('hide'))
                clean(eventListener);
            else {
                setTimeout(() => {
                    window.addEventListener('click', eventListener);
                }, 0);
            }
        });
        exportTypes.forEach((exportType, index) => {
            if (index == 0) {
                let mouseoverEventListener = () => {
                    exportType.style.backgroundColor = '#d9d9d9';
                    dropdownPointer.style.backgroundColor = '#d9d9d9';
                };
                let mouseleaveEventListener = () => {
                    exportType.style.backgroundColor = 'white';
                    dropdownPointer.style.backgroundColor = 'white';
                };
                exportType.addEventListener('mouseover', mouseoverEventListener);
                exportType.addEventListener('mouseleave', mouseleaveEventListener);
                dropdownPointer.addEventListener('mouseover', mouseoverEventListener);
                dropdownPointer.addEventListener('mouseleave', mouseleaveEventListener);
                dropdownPointer.addEventListener('click', () => exportType.click());
            }
            exportType.addEventListener('click', () => {
                clean(eventListener);
                if (exportBtn.classList.contains('prime'))
                    prime.send('export', exportType.id.replace('export-', ''));
                else
                    side.send('export', exportType.id.replace('export-', ''));
                exportBtn.click();
            });
        });
    });
    Array.from(document.getElementsByClassName('zoom-out-btn')).forEach(zoomOutBtn => {
        zoomOutBtn.addEventListener('click', () => {
            if (zoomOutBtn.classList.contains('prime'))
                prime.send('zoom-out');
            else
                side.send('zoom-out');
        });
    });
})();
(() => {
    let contCont = document.querySelector('.controls-container');
    let borderHide = document.querySelector('.border-hide');
    let hidePane = document.getElementById('pane-hide-btn');
    let showPane = document.getElementById('pane-show-btn');
    const togglePane = (ev) => {
        const hide = ev.currentTarget.id == 'pane-hide-btn';
        showPane.parentElement.classList.toggle('hide', !hide);
        contCont.classList.toggle('hide', hide);
        borderHide.classList.toggle('hide', hide);
    };
    hidePane.onclick = togglePane;
    showPane.onclick = togglePane;
})();
const sendParameter = (key, value) => {
    window['sendSig'](JSON.stringify({
        [key]: parseFloat(value) || value,
    }));
};
let sendParams = () => {
    gaParams.forEach(gaParam => {
        let value;
        value =
            gaParam.classList.contains('is-disable-able') &&
                !gaParam.parentElement.parentElement.parentElement.previousElementSibling.checked
                ? false
                : gaParam.value;
        sendParameter(gaParam.name, value);
    });
    gaTypes.filter(gaType => gaType.checked).forEach(gaType => sendParameter(gaType.name, gaType.value));
};
document.addEventListener('DOMContentLoaded', function loaded() {
    document.removeEventListener('DOMContentLoaded', loaded);
    (() => {
        let ready = () => {
            ready = () => {
                window['affectSettings'](settings['renderer']['input'], 'main');
                sendParams();
                (() => {
                    let eventListener = (ev) => {
                        let gaParam = ev.target;
                        sendParameter(gaParam.name, gaParam.value);
                    };
                    gaParams.forEach(gaParam => {
                        gaParam.addEventListener('keyup', eventListener);
                        if (gaParam.classList.contains('textfieldable'))
                            gaParam.addEventListener('change', eventListener);
                    });
                    gaTypes.forEach(gaType => {
                        if (gaType.name == 'update_pop')
                            gaType.addEventListener('change', eventListener);
                    });
                    let lRSwitchUpdater = () => {
                        prime.send('live-rendering', lRSwitch.checked);
                    };
                    lRSwitch.addEventListener('change', lRSwitchUpdater);
                    lRSwitchUpdater();
                })();
                delete window['isDev'];
                delete window['settings'];
            };
            zoomViews = window['ready'](window['pyshell'], prime, side, treatResponse, webFrame);
            toggleDisableOnRun(true);
            zoomViews();
            window['loaded']();
            delete window['ready'];
            delete window['pyshell'];
            delete window['loaded'];
        };
        prime.addEventListener('dom-ready', () => ready());
        side.addEventListener('dom-ready', () => ready());
    })();
    window['params']();
    window['saveSettings'](settings['renderer']['input']);
    ipcRenderer.on('zoom', (_event, type) => {
        if (type == 'in') {
            if (webFrame.getZoomFactor() < 1.8)
                webFrame.setZoomFactor(webFrame.getZoomFactor() + 0.1);
        }
        else if (type == 'out') {
            if (webFrame.getZoomFactor() > 0.6)
                webFrame.setZoomFactor(webFrame.getZoomFactor() - 0.1);
        }
        else {
            webFrame.setZoomFactor(1);
        }
        zoomViews();
    });
    window['border']();
    delete window['border'];
    (() => {
        let main = document.getElementById('main');
        gaCPBtn.onclick = () => {
            isGACPOpen = true;
            ipcRenderer.send('ga-cp', settings);
            main.classList.toggle('blur', true);
            ipcRenderer.once('ga-cp-finished', (_ev, updatedSettings) => {
                isGACPOpen = false;
                main.classList.toggle('blur', false);
                if (!updatedSettings)
                    return;
                saveSettings(settings['renderer']['input']);
                affectSettings(settings['renderer']['input'], 'main');
                sendParams();
            });
        };
        window.addEventListener('beforeunload', () => {
            ipcRenderer.send('close-ga-cp');
            main.classList.add('hide');
            window['sendSig']('stop');
        });
    })();
});
if (window['isDev']) {
    window['k-shorts'](prime, side, ipcRenderer);
    delete window['k-shorts'];
}
//# sourceMappingURL=renderer.js.map