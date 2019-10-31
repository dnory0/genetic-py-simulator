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
const parameterChanged = (numInput, checkInput, evType, key) => {
    setTimeout(() => {
        if (evType == 'keypress' && isNaN(parseFloat(key)))
            return;
        if ((isNaN(parseFloat(numInput.min)) ||
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
            numInput.style.backgroundColor = '#ff5a5a';
    }, 0);
};
document.addEventListener('DOMContentLoaded', function () {
    primary.addEventListener('dom-ready', () => setReady());
    secondary.addEventListener('dom-ready', () => setReady());
    popSize.onkeypress = popSize.onchange = pSRandom.onchange = (event) => {
        parameterChanged(popSize, pSRandom, event.type, event.key);
    };
    genesNum.onkeypress = genesNum.onchange = gNRandom.onchange = (event) => {
        parameterChanged(genesNum, gNRandom, event.type, event.key);
    };
    crossover.onkeypress = crossover.onchange = coRandom.onchange = (event) => {
        parameterChanged(crossover, coRandom, event.type, event.key);
    };
    mutation.onkeypress = mutation.onchange = mutRandom.onchange = (event) => {
        parameterChanged(mutation, mutRandom, event.type, event.key);
    };
    delay.onkeypress = delay.onchange = delayRandom.onchange = (event) => {
        parameterChanged(delay, delayRandom, event.type, event.key);
    };
    if (window['isDev']) {
        delete window['isDev'];
        ipcRenderer.on('devTools', (_event, webView) => {
            if (webView == 'primary')
                primary.getWebContents().toggleDevTools();
            else if (webView == 'secondary')
                secondary.getWebContents().toggleDevTools();
        });
    }
    ipcRenderer.on('zoom', (_event, type) => {
        if (type == 'in') {
            if (webFrame.getZoomFactor() < 2)
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
    let sliders = document.getElementsByClassName('slider');
    Array.from(sliders).forEach((slider) => {
        const prevSib = slider.previousElementSibling;
        if (slider.classList.contains('ver')) {
            slider.onmousedown = e => {
                (slider.nextElementSibling.querySelector('.resize-cover')).style.display = 'block';
                (document.querySelector('.primary-container').lastElementChild).style.display = 'block';
                let dragY = e.clientX;
                window.onmousemove = e => {
                    if (e.clientX <= document.body.offsetWidth - 280 &&
                        e.clientX >= 299) {
                        prevSib.style.width =
                            prevSib.offsetWidth + e.clientX - dragY + 'px';
                        dragY = e.clientX;
                    }
                };
                window.onmouseup = () => {
                    window.onmousemove = window.onmouseup = null;
                    (slider.nextElementSibling.querySelector('.resize-cover')).style.display = 'none';
                    (document.querySelector('.primary-container').lastElementChild).style.display = 'none';
                };
            };
        }
        else if (slider.classList.contains('hor')) {
            slider.onmousedown = e => {
                prevSib.querySelector('.resize-cover').style.display =
                    'block';
                (document.querySelector('.secondary-container').lastElementChild).style.display = 'block';
                let dragX = e.clientY;
                document.onmousemove = e => {
                    if (e.clientY <= document.body.offsetHeight - 217 &&
                        e.clientY >= 200) {
                        prevSib.style.height =
                            prevSib.offsetHeight + e.clientY - dragX + 'px';
                        dragX = e.clientY;
                    }
                };
                document.onmouseup = () => {
                    document.onmousemove = document.onmouseup = null;
                    (prevSib.querySelector('.resize-cover')).style.display = 'none';
                    (document.querySelector('.secondary-container').lastElementChild).style.display = 'none';
                };
            };
        }
    });
    window.addEventListener('beforeunload', window['exit']);
});
//# sourceMappingURL=renderer.js.map