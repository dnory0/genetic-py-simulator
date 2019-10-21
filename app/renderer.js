"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let pyshell = window.pyshell;
const webFrame = window.webFrame;
const ipcRenderer = window.ipcRenderer;
const play = window.play;
const pause = window.pause;
const stop = window.stop;
const replay = window.replay;
const stepForward = window.stepForward;
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
const prime = document.querySelector('.primary-container');
const second = document.querySelector('.secondary-container');
const resizeReporter = () => {
    ipcRenderer.send('resize', {
        primary: {
            x: Math.floor(prime.getBoundingClientRect().left),
            y: Math.floor(prime.getBoundingClientRect().top),
            width: Math.floor(prime.offsetWidth * webFrame.getZoomFactor()),
            height: Math.floor(prime.offsetHeight * webFrame.getZoomFactor())
        },
        secondary: {
            x: Math.floor(second.getBoundingClientRect().left * webFrame.getZoomFactor() + 2),
            y: Math.floor(second.getBoundingClientRect().top * webFrame.getZoomFactor() + 2),
            width: Math.floor(second.getBoundingClientRect().width * webFrame.getZoomFactor() - 2),
            height: Math.floor(second.getBoundingClientRect().height * webFrame.getZoomFactor() - 2)
        },
        zoom: webFrame.getZoomLevel()
    });
};
window.onresize = () => {
    setTimeout(resizeReporter, 40);
};
ipcRenderer.once('views-ready', resizeReporter);
let isRunning = false;
const treatResponse = (response) => {
    if (response['started'] && response['genesNum'] !== undefined) {
        setClickable();
    }
    else if (response['finished']) {
        setClickable(false);
    }
};
pyshell.stdout.on('data', (response) => {
    response
        .toString()
        .split('\n')
        .forEach((args) => {
        console.log(args);
        if (args)
            treatResponse(JSON.parse(args));
    });
});
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
playBtn.onclick = () => {
    isRunning = !isRunning;
    if (isRunning) {
        play();
    }
    else {
        pause();
    }
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
webFrame.setZoomLevel(0);
//# sourceMappingURL=renderer.js.map