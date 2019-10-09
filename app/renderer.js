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
const settingXaxis = (args, ...charts) => {
    const genes = [...Array(args['genesNum']).keys()].map(v => `${++v}`);
    charts.forEach(chart => {
        chart.xAxis[0].setCategories(genes);
    });
};
const enableChartHover = (enable, ...charts) => {
    charts.forEach((chart) => {
        chart.options.tooltip.enabled = enable;
        chart.update({
            plotOptions: {
                series: {
                    marker: {
                        enabled: enable,
                        radius: enable ? 2 : null
                    },
                    states: {
                        hover: {
                            halo: {
                                opacity: enable ? 0.5 : 0
                            }
                        }
                    }
                }
            }
        });
    });
};
const clearChart = (chart, categories = true) => {
    if (categories)
        chart.xAxis[0].setCategories([]);
    chart.series[0].setData([]);
    chart.redraw();
};
let isRunning = false;
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
    Array.from(document.querySelector('.controls').children).forEach((element, index) => {
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