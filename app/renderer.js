"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const Highcharts = require("highcharts");
function isDev() {
    return process.mainModule.filename.indexOf('.asar') === -1;
}
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
let fittestChart;
let currentChart;
let mostFittest = { fitness: -1 };
let fittestHistory = [];
const initChart = (containerId, options) => {
    return Highcharts.chart(containerId, {
        title: {
            text: options.title.text,
            style: {
                padding: '80px'
            }
        },
        xAxis: {
            title: {
                text: options.xAxis.title.text,
                align: 'high'
            }
        },
        yAxis: {
            title: {
                text: options.yAxis.title.text,
                align: 'high',
                rotation: 0,
                y: -20,
                x: -5,
                offset: -35
            }
        },
        series: options.series,
        plotOptions: {
            series: {
                animation: false,
                states: {
                    hover: {
                        halo: {
                            opacity: 0
                        }
                    }
                }
            }
        },
        legend: {
            enabled: false
        },
        credits: {
            enabled: false
        }
    });
};
fittestChart = initChart('fittest-chart', {
    chart: {
        type: 'line'
    },
    title: {
        text: 'Best Fittest'
    },
    xAxis: {
        title: {
            text: 'Genes'
        }
    },
    yAxis: {
        title: {
            text: 'Gene value'
        }
    },
    series: [
        {
            data: []
        }
    ]
});
currentChart = initChart('current-chart', {
    chart: {
        type: 'line'
    },
    title: {
        text: 'Current Generation Fittest'
    },
    xAxis: {
        title: {
            text: 'Genes'
        }
    },
    series: [
        {
            data: []
        }
    ],
    yAxis: {
        title: {
            text: 'Gene value'
        }
    }
});
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
const addToChart = (args) => {
    if (args['generation'] !== undefined &&
        args['fitness'] !== undefined &&
        args['genes'] !== undefined) {
        currentChart.series[0].setData(args['genes'], true, false);
        fittestHistory.push(args['genes']);
        if (mostFittest['fitness'] < args['fitness']) {
            mostFittest['fitness'] = args['fitness'];
            mostFittest['individuals'] = [
                {
                    generation: args['generation'],
                    genes: args['genes']
                }
            ];
            fittestChart.series[0].setData(mostFittest.individuals[0].genes, true, false);
        }
        else if (mostFittest['fitness'] == args['fitness']) {
            mostFittest['individuals'].unshift({
                generation: args['generation'],
                genes: args['genes']
            });
            fittestChart.series[0].setData(mostFittest.individuals[0].genes, true, false);
        }
    }
    else if (args['started'] && args['genesNum'] !== undefined) {
        clearChart(fittestChart);
        clearChart(currentChart);
        fittestHistory = [];
        mostFittest = { fitness: -1 };
        settingXaxis(args, currentChart, fittestChart);
        setClickable();
    }
};
const play = () => {
    enableChartHover(false, fittestChart, currentChart);
};
const pause = () => {
    enableChartHover(true, fittestChart, currentChart);
};
const stop = () => {
    enableChartHover(true, fittestChart, currentChart);
};
const replay = () => {
    enableChartHover(false, fittestChart, currentChart);
};
const stepForward = () => {
    enableChartHover(true, fittestChart, currentChart);
};
const exit = () => {
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
electron_1.ipcRenderer.on('pyshell', () => {
    exit();
});
//# sourceMappingURL=renderer.js.map