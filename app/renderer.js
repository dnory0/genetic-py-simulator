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
let popSize = document.getElementById('pop-size');
let pSRandom = document.getElementById('random-pop-size');
let genesNum = document.getElementById('genes-num');
let gNRandom = document.getElementById('random-genes-num');
let crossover = document.getElementById('crossover-rate');
let coRandom = (document.getElementById('random-crossover-rate'));
let mutation = document.getElementById('mutation-rate');
let mutRandom = (document.getElementById('random-mutation-rate'));
let delay = document.getElementById('delay-rate');
let delayRandom = (document.getElementById('random-delay-rate'));
let lRSwitch = document.getElementById('live-rendering');
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
const sendParameter = (numInput, checkInput) => {
    numInput.style.backgroundColor = '#fff';
    window['sendSig'](JSON.stringify({
        [numInput.name]: parseFloat(numInput.value),
        [checkInput.name]: checkInput.checked
    }));
};
document.addEventListener('DOMContentLoaded', function loaded() {
    document.removeEventListener('DOMContentLoaded', loaded);
    (() => {
        let ready = () => {
            ready = () => {
                prime.send('mode', window['isDev']);
                side.send('mode', window['isDev']);
                delete window['isDev'];
                lRSwitch.onchange = () => prime.send('update-mode', lRSwitch.checked);
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
    const rangeChange = (rangeInput, numberInput, checkbox) => {
        setTimeout(() => {
            numberInput.value = rangeInput.value;
            sendParameter(numberInput, checkbox);
        }, 0);
    };
    const numberChange = (rangeInput, numberInput) => {
        setTimeout(() => {
            rangeInput.value = numberInput.value;
        }, 0);
    };
    Array.from(document.getElementsByClassName('input-wrapper')).forEach((wrapper) => {
        const first = wrapper.firstElementChild;
        const last = wrapper.lastElementChild;
        const checkbox = (wrapper.nextElementSibling.firstElementChild);
        first.onmousedown = () => {
            first.onmousemove = () => rangeChange(first, last, checkbox);
            rangeChange(first, last, checkbox);
            first.onmouseup = () => (first.onmouseup = first.onmousemove = null);
        };
    });
    const parameterChanged = (numInput, checkInput, mustBeInt, event) => {
        setTimeout(() => {
            if (isNaN(numInput.value) ||
                [
                    'Control',
                    'Shift',
                    'Alt',
                    'CapsLock',
                    'AltGraph',
                    'Tab',
                    'Enter',
                    'ArrowLeft',
                    'ArrowRight',
                    'Home',
                    'End'
                ].includes(event.key))
                return;
            if (mustBeInt &&
                !isNaN(parseInt(numInput.value)) &&
                parseInt(numInput.value) == numInput.value) {
                numInput.value = `${parseInt(numInput.value) + 1}`;
                numInput.value = `${parseInt(numInput.value) - 1}`;
            }
            if (((mustBeInt && !numInput.value.includes('.')) || !mustBeInt) &&
                (isNaN(parseFloat(numInput.min)) ||
                    parseFloat(numInput.value) >= parseFloat(numInput.min)) &&
                (isNaN(parseFloat(numInput.max)) ||
                    parseFloat(numInput.value) <= parseFloat(numInput.max))) {
                sendParameter(numInput, checkInput);
                if (!mustBeInt)
                    numberChange(numInput.previousElementSibling, numInput);
            }
            else
                numInput.style.backgroundColor = '#ff4343b8';
        }, 0);
    };
    popSize.onkeyup = pSRandom.onchange = (event) => {
        parameterChanged(popSize, pSRandom, true, event);
    };
    genesNum.onkeyup = gNRandom.onchange = (event) => {
        parameterChanged(genesNum, gNRandom, true, event);
    };
    crossover.onkeyup = coRandom.onchange = (event) => {
        parameterChanged(crossover, coRandom, false, event);
    };
    mutation.onkeyup = mutRandom.onchange = (event) => {
        parameterChanged(mutation, mutRandom, false, event);
    };
    delay.onkeyup = delayRandom.onchange = (event) => {
        parameterChanged(delay, delayRandom, false, event);
    };
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
    window.addEventListener('beforeunload', () => {
        document.getElementById('main').style.display = 'none';
        window['sendSig']('exit');
    });
});
ipcRenderer.send('settings');
ipcRenderer.send('mode');
ipcRenderer.once('mode', (_ev, isDev) => {
    if (isDev) {
        window['k-shorts'](prime, side, ipcRenderer);
        delete window['k-shorts'];
    }
    window['isDev'] = isDev;
    sendParameter(popSize, pSRandom);
    sendParameter(genesNum, gNRandom);
    sendParameter(crossover, coRandom);
    sendParameter(mutation, mutRandom);
    sendParameter(delay, delayRandom);
    prime.addEventListener('did-finish-load', () => prime.send('update-mode', lRSwitch.checked));
});
ipcRenderer.once('settings', (_ev, settings) => {
    popSize.value = settings['renderer']['parameters']['population']['size'];
    pSRandom.value = settings['renderer']['parameters']['population']['random'];
    genesNum.value = settings['renderer']['parameters']['genes']['number'];
    gNRandom.value = settings['renderer']['parameters']['genes']['random'];
    crossover.value = settings['renderer']['parameters']['crossover']['rate'];
    crossover.parentElement.firstElementChild.value =
        settings['renderer']['parameters']['crossover']['rate'];
    coRandom.value = settings['renderer']['parameters']['crossover']['random'];
    mutation.value = settings['renderer']['parameters']['mutation']['rate'];
    mutation.parentElement.firstElementChild.value =
        settings['renderer']['parameters']['mutation']['rate'];
    mutRandom.value = settings['renderer']['parameters']['mutation']['random'];
    delay.value = settings['renderer']['parameters']['delay']['rate'];
    delay.parentElement.firstElementChild.value =
        settings['renderer']['parameters']['delay']['rate'];
    delayRandom.value = settings['renderer']['parameters']['delay']['random'];
    lRSwitch.checked = settings['renderer']['controls']['live-rendering'];
    prime.parentElement.style.height = settings['renderer']['ui']['horizontal'];
});
//# sourceMappingURL=renderer.js.map