"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
const Highcharts = require("highcharts");
const child_process_1 = require("child_process");
const fs_1 = require("fs");
function isDev() {
    return process.mainModule.filename.indexOf('.asar') === -1;
}
let playBtn = document.getElementById('play-btn');
let stopBtn = document.getElementById('stop-btn');
let toStartBtn = document.getElementById('to-start-btn');
let stepFBtn = document.getElementById('step-forward-btn');
let progressChart;
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
progressChart = initChart('progress-chart', {
    chart: {
        type: 'line'
    },
    title: {
        text: 'Fittest Fitness per Generation'
    },
    xAxis: {
        title: {
            text: 'Generation'
        }
    },
    yAxis: {
        title: {
            text: 'Fitness value'
        }
    },
    series: [
        {
            name: 'CGA',
            data: []
        }
    ]
});
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
let pyshell;
const addToChart = (args) => {
    if (args['generation'] !== undefined &&
        args['fitness'] !== undefined &&
        args['genes'] !== undefined) {
        progressChart.series[0].addPoint(parseInt(args['fitness']), true, false, false);
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
        clearChart(progressChart);
        clearChart(fittestChart);
        clearChart(currentChart);
        fittestHistory = [];
        mostFittest = { fitness: -1 };
        settingXaxis(args, currentChart, fittestChart);
        setClickable();
    }
};
if (isDev()) {
    pyshell = child_process_1.spawn(`${process.platform == 'win32' ? 'python' : 'python3'}`, [
        path_1.join(__dirname, 'python', 'ga.py')
    ]);
}
else {
    let copyFrom;
    let copyTo;
    let execExist = fs_1.existsSync(path_1.join(__dirname, 'python', 'dist', process.platform == 'win32' ? path_1.join('win', 'ga.exe') : path_1.join('linux', 'ga')));
    if (execExist) {
        copyFrom = path_1.join(__dirname, 'python', 'dist', process.platform == 'win32' ? path_1.join('win', 'ga.exe') : path_1.join('linux', 'ga'));
        copyTo = path_1.join(electron_1.remote.app.getPath('temp'), process.platform == 'win32' ? 'ga.exe' : 'ga');
    }
    else {
        copyFrom = path_1.join(__dirname, 'python', 'ga.py');
        copyTo = path_1.join(electron_1.remote.app.getPath('temp'), 'ga.py');
    }
    fs_1.copyFileSync(copyFrom, copyTo);
    pyshell = child_process_1.spawn(execExist
        ? copyTo
        : `${process.platform == 'win32' ? 'python' : 'python3'}`, execExist ? [] : [copyTo]);
}
pyshell.stdout.on('data', (passedArgs) => {
    passedArgs
        .toString()
        .split('\n')
        .forEach((args) => {
        if (args)
            addToChart(JSON.parse(args));
    });
});
pyshell.on('error', (err) => console.error(`error trace: ${err}`));
const play = () => {
    pyshell.stdin.write('"play"\n');
    enableChartHover(false, progressChart, fittestChart, currentChart);
};
const pause = () => {
    pyshell.stdin.write('"pause"\n');
    enableChartHover(true, progressChart, fittestChart, currentChart);
};
const stop = () => {
    pyshell.stdin.write('"stop"\n');
    enableChartHover(true, progressChart, fittestChart, currentChart);
};
const replay = () => {
    pyshell.stdin.write('"replay"\n');
    enableChartHover(false, progressChart, fittestChart, currentChart);
};
const stepForward = () => {
    pyshell.stdin.write('"step_f"\n');
    enableChartHover(true, progressChart, fittestChart, currentChart);
};
const exit = () => {
    pyshell.stdin.write('"exit"\n');
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
electron_1.ipcRenderer.on('pyshell', () => {
    exit();
});
//# sourceMappingURL=renderer.js.map