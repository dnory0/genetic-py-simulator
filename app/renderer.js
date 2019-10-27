"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let pyshell = window['pyshell'];
let ipcRenderer = window['ipcRenderer'];
let webFrame = window['webFrame'];
const primary = document.getElementById('primary-chart');
const secondary = document.getElementById('secondary-chart');
const play = window['play'];
const pause = window['pause'];
const stop = window['stop'];
const replay = window['replay'];
const stepForward = window['stepForward'];
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
    if (isRunning) {
        pause();
    }
    else {
        play();
    }
    isRunning = !isRunning;
    switchBtn();
};
stopBtn.onclick = () => {
    setClickable(false);
    stop();
    isRunning = false;
    switchBtn();
};
toStartBtn.onclick = () => {
    replay();
    isRunning = true;
    switchBtn();
};
stepFBtn.onclick = () => {
    stepForward();
    isRunning = false;
    switchBtn();
};
let setReady = () => {
    setTimeout(() => {
        if (!(primary.isLoading() || secondary.isLoading())) {
            pyshell.stdout.on('data', (response) => {
                secondary.send('data', response);
                primary.send('data', response);
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
            document.getElementById('loading-bg').style.opacity = '0';
            document.getElementById('main').style.opacity = '1';
            document.getElementById('main').style.pointerEvents = 'inherit';
            setTimeout(() => {
                document.body.removeChild(document.getElementById('loading-bg'));
            }, 0.2);
        }
        setReady = undefined;
    }, 0);
};
const parameterChanged = (numInput, checkInput, evType, key) => {
    if (evType == 'keyup')
        if (isNaN(parseInt(key)) && key != 'Backspace')
            return;
    if ((isNaN(parseFloat(numInput.min)) ||
        parseFloat(numInput.value) >= parseFloat(numInput.min)) &&
        (isNaN(parseFloat(numInput.max)) ||
            parseFloat(numInput.value) <= parseFloat(numInput.max))) {
        numInput.style.backgroundColor = '#fff';
        pyshell.stdin.write(`${JSON.stringify({
            [numInput.name]: parseFloat(numInput.value),
            [checkInput.name]: checkInput.checked
        })}\n`, (error) => {
            if (error)
                throw error;
        });
    }
    else
        numInput.style.backgroundColor = '#ff5a5a';
};
document.addEventListener('DOMContentLoaded', function () {
    primary.addEventListener('did-finish-load', setReady);
    secondary.addEventListener('did-finish-load', setReady);
    popSize.onkeyup = popSize.onchange = pSRandom.onchange = (event) => {
        parameterChanged(popSize, pSRandom, event.type, event.key);
    };
    genesNum.onkeyup = genesNum.onchange = gNRandom.onchange = (event) => {
        parameterChanged(genesNum, gNRandom, event.type, event.key);
    };
    crossover.onkeyup = crossover.onchange = coRandom.onchange = (event) => {
        parameterChanged(crossover, coRandom, event.type, event.key);
    };
    mutation.onkeyup = mutation.onchange = mutRandom.onchange = (event) => {
        parameterChanged(mutation, mutRandom, event.type, event.key);
    };
    delay.onkeyup = delay.onchange = delayRandom.onchange = (event) => {
        parameterChanged(delay, delayRandom, event.type, event.key);
    };
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
    window.addEventListener('beforeunload', () => {
        pyshell.stdin.write(`${JSON.stringify({ exit: true })}\n`);
    });
});
//# sourceMappingURL=renderer.js.map