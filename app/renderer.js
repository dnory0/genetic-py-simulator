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
let lRSwitch = document.getElementById('live-rendering');
let gaCPBtn = document.getElementById('ga-cp-btn');
let popSize = document.getElementById('pop-size');
let genesNum = document.getElementById('genes-num');
let coRate = document.getElementById('co-rate');
let mutRate = document.getElementById('mut-rate');
let delRate = document.getElementById('del-rate');
let settings = window['settings'];
let isRunning = false;
const treatResponse = (response) => {
    if (response['started']) {
        setClickable();
    }
    else if (response['finished']) {
        setClickable(false);
        blinkPlayBtn();
    }
};
const switchPlayBtn = () => {
    playBtn.querySelector('.play').style.display = isRunning
        ? 'none'
        : 'block';
    playBtn.querySelector('.pause').style.display = isRunning
        ? 'block'
        : 'none';
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
    if (signal == 'stop')
        setClickable(false);
    window['sendSig'](signal);
    isRunning = goingToRun;
    switchPlayBtn();
};
playBtn.onclick = () => ctrlClicked(isRunning ? 'pause' : 'play', !isRunning);
stopBtn.onclick = () => ctrlClicked('stop', false);
toStartBtn.onclick = () => ctrlClicked('replay', true);
stepFBtn.onclick = () => ctrlClicked('step_f', false);
const sendParameter = (numInput) => {
    numInput.style.backgroundColor = '#fff';
    window['sendSig'](JSON.stringify({
        [numInput.name]: parseFloat(numInput.value)
    }));
};
document.addEventListener('DOMContentLoaded', function loaded() {
    document.removeEventListener('DOMContentLoaded', loaded);
    (() => {
        let ready = () => {
            ready = () => {
                window['affectSettings'](settings['renderer']['input']);
                sendParameter(popSize);
                sendParameter(genesNum);
                sendParameter(coRate);
                sendParameter(mutRate);
                sendParameter(delRate);
                lRSwitch.addEventListener('change', () => {
                    prime.send('live-rendering', lRSwitch.checked);
                });
                prime.send('live-rendering', lRSwitch.checked);
                prime.parentElement.style.height =
                    settings['renderer']['ui']['horizontal'];
                delete window['isDev'];
                delete window['settings'];
            };
            zoomViews = window['ready'](window['pyshell'], prime, side, treatResponse, webFrame);
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
        Array.from(document.getElementsByClassName('border'))
            .concat(Array.from(document.getElementsByClassName('separator')))
            .forEach((border) => {
            let scale;
            if (border.classList.contains('hor'))
                scale = 'scaleY';
            else
                scale = 'scaleX';
            border.style['transform'] = `${scale}(${(webFrame.getZoomFactor() < 1.5
                ? 1
                : 2) / webFrame.getZoomFactor()})`;
        });
        zoomViews();
    });
    window['border']();
    delete window['border'];
    (() => {
        let main = document.getElementById('main');
        gaCPBtn.onclick = () => {
            ipcRenderer.send('ga-cp', settings);
            main.style.pointerEvents = 'none';
            main.style.filter = 'blur(1px)';
            ipcRenderer.once('ga-cp-finished', (_ev, newSettings) => {
                main.style.pointerEvents = 'all';
                main.style.filter = 'none';
                console.log(`ga-cp-finished: ${newSettings}`);
            });
        };
        window.addEventListener('beforeunload', () => {
            ipcRenderer.send('close-ga-cp');
            main.style.display = 'none';
        });
    })();
});
if (window['isDev']) {
    window['k-shorts'](prime, side, ipcRenderer);
    delete window['k-shorts'];
}
ipcRenderer.on('settings', () => ipcRenderer.send('settings', settings));
//# sourceMappingURL=renderer.js.map