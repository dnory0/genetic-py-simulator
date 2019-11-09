"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let pyshell = window['pyshell'];
delete window['pyshell'];
let ipcRenderer = window['ipcRenderer'];
delete window['ipcRenderer'];
let webFrame = window['webFrame'];
delete window['webFrame'];
const primary = document.getElementById('primary-chart');
const secondary = document.getElementById('secondary-chart');
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
let isRunning = false;
const treatResponse = (response) => {
    if (response['started'] && response['genesNum'] !== undefined) {
        setClickable();
    }
    else if (response['finished']) {
        setClickable(false);
        blinkPlayBtn();
    }
    else if (response['stopped']) {
        setClickable(false);
    }
    else if (response['is_setup']) {
        console.log('setup finished');
    }
};
const switchBtn = () => {
    if (isRunning) {
        playBtn.querySelector('.play').style.display = 'none';
        playBtn.querySelector('.pause').style.display = 'block';
    }
    else {
        playBtn.querySelector('.play').style.display = 'block';
        playBtn.querySelector('.pause').style.display = 'none';
    }
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
playBtn.onclick = () => {
    if (isRunning)
        window['pause']();
    else
        window['play']();
    isRunning = !isRunning;
    switchBtn();
};
stopBtn.onclick = () => {
    setClickable(false);
    window['stop']();
    isRunning = false;
    switchBtn();
};
toStartBtn.onclick = () => {
    window['replay']();
    isRunning = true;
    switchBtn();
};
stepFBtn.onclick = () => {
    window['stepForward']();
    isRunning = false;
    switchBtn();
};
let setReady = () => {
    setReady = () => { };
    pyshell.stdout.on('data', (response) => {
        primary.send('data', response);
        secondary.send('data', response);
        response
            .toString()
            .split('\n')
            .forEach((args) => {
            if (args)
                treatResponse(JSON.parse(args));
        });
    });
    zoomViews = () => {
        primary.setZoomFactor(webFrame.getZoomFactor());
        secondary.setZoomFactor(webFrame.getZoomFactor());
    };
    zoomViews();
    if (document.getElementById('loading-bg')) {
        document.getElementById('loading-bg').style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(document.getElementById('loading-bg'));
        }, 0.2);
    }
    document.getElementById('main').style.opacity = '1';
    document.getElementById('main').style.pointerEvents = 'inherit';
};
document.addEventListener('DOMContentLoaded', function loaded() {
    document.removeEventListener('DOMContentLoaded', loaded);
    primary.addEventListener('dom-ready', () => setReady());
    secondary.addEventListener('dom-ready', () => setReady());
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
                numInput.style.backgroundColor = '#fff';
                pyshell.stdin.write(`${JSON.stringify({
                    [numInput.name]: parseFloat(numInput.value),
                    [checkInput.name]: checkInput.checked
                })}\n`);
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
    if (window['isDev']) {
        delete window['isDev'];
        const devToolsToggler = (webView) => {
            if (webView == 'primary')
                primary.getWebContents().toggleDevTools();
            else if (webView == 'secondary')
                secondary.getWebContents().toggleDevTools();
        };
        ipcRenderer.on('devTools', (_event, webView) => devToolsToggler(webView));
        window.addEventListener('keyup', (event) => {
            if (event.code == 'Backquote')
                if (event.ctrlKey)
                    devToolsToggler(event.shiftKey ? 'secondary' : 'primary');
        }, true);
        primary.addEventListener('ipc-message', (event) => {
            if (event.channel == 'devTools')
                devToolsToggler(event.args);
        });
        secondary.addEventListener('ipc-message', (event) => {
            if (event.channel == 'devTools')
                devToolsToggler(event.args);
        });
    }
    Array.from(document.getElementsByClassName('border')).forEach((border) => {
        const prevSib = border.previousElementSibling, nextSib = border.nextElementSibling, prevDisp = prevSib.style.display, nextDisp = nextSib.style.display;
        let prevRes, minPrevRes, minNextRes, client, winRes;
        if (border.classList.contains('ver')) {
            prevRes = 'width';
            minPrevRes = window.getComputedStyle(prevSib).minWidth.slice(0, -2);
            minNextRes = window.getComputedStyle(nextSib).minWidth.slice(0, -2);
            client = 'clientX';
            winRes = 'innerWidth';
        }
        else if (border.classList.contains('hor')) {
            prevRes = 'height';
            minPrevRes = window.getComputedStyle(prevSib).minHeight.slice(0, -2);
            minNextRes = window.getComputedStyle(nextSib).minHeight.slice(0, -2);
            client = 'clientY';
            winRes = 'innerHeight';
        }
        border.onmousedown = () => {
            document
                .querySelectorAll('.resize-cover')
                .forEach((ele) => (ele.style.display = 'block'));
            window.onmousemove = (e) => {
                if (e[client] >= minPrevRes &&
                    e[client] <= window[winRes] - minNextRes)
                    prevSib.style[prevRes] = e[client] + 'px';
                else if (e[client] < minPrevRes) {
                    if (e[client] < 100) {
                        border.style.padding = '0 4px 4px 0';
                        border.style.margin = '-1px';
                        prevSib.style.display = 'none';
                    }
                    else if (e[client] >= 100)
                        if (prevSib.style.display == 'none') {
                            border.style.padding = '';
                            border.style.margin = '';
                            prevSib.style.display = prevDisp;
                        }
                }
                else {
                    if (window[winRes] - e[client] < 100) {
                        if (nextSib.style.display != 'none') {
                            border.style.margin = '-1px';
                            border.style.padding = '4px 0 0 4px';
                            nextSib.style.display = 'none';
                            prevSib.style.flex = '1';
                        }
                    }
                    else if (window[winRes] - e[client] >= 100) {
                        if (nextSib.style.display == 'none') {
                            border.style.padding = '';
                            border.style.margin = '';
                            nextSib.style.display = nextDisp;
                            prevSib.style.flex = 'unset';
                        }
                    }
                }
            };
            window.onmouseup = () => {
                window.onmousemove = window.onmouseup = null;
                document
                    .querySelectorAll('.resize-cover')
                    .forEach((ele) => (ele.style.display = 'none'));
            };
        };
    });
    window.addEventListener('beforeunload', window['exit']);
});
//# sourceMappingURL=renderer.js.map