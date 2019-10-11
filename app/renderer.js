"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let pyshell = window.pyshell;
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
let coRandom = document.getElementById('random-crossover');
let mutation = document.getElementById('mutation-rate');
let mutRandom = document.getElementById('random-mutation');
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
const parameterChanged = (event) => {
    if (event.type == 'keyup')
        if (isNaN(parseInt(event.key)) &&
            event.key != 'Backspace')
            return;
    if ((isNaN(parseFloat(event.target.min)) ||
        parseFloat(event.target.value) >=
            parseFloat(event.target.min)) &&
        (isNaN(parseFloat(event.target.max)) ||
            parseFloat(event.target.value) <=
                parseFloat(event.target.max))) {
        event.target.style.backgroundColor = '#fff';
        pyshell.stdin.write(`${JSON.stringify({
            [event.target.name]: parseFloat(event.target.value)
        })}\n`, (error) => {
            if (error)
                throw error;
        });
    }
    else
        event.target.style.backgroundColor = '#ff5a5a';
};
popSize.addEventListener('change', parameterChanged);
popSize.addEventListener('keyup', parameterChanged);
genesNum.addEventListener('change', parameterChanged);
genesNum.addEventListener('keyup', parameterChanged);
crossover.addEventListener('change', parameterChanged);
crossover.addEventListener('keyup', parameterChanged);
mutation.addEventListener('change', parameterChanged);
mutation.addEventListener('keyup', parameterChanged);
//# sourceMappingURL=renderer.js.map