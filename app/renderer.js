"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const python_shell_1 = require("python-shell");
const path = require("path");
const Highcharts = require("highcharts");
let playBtn = document.getElementById('play-btn');
let stopBtn = document.getElementById('stop-btn');
let toStartBtn = document.getElementById('to-start-btn');
let stepFBtn = document.getElementById('step-forward-btn');
let progressChart;
let fittestChart;
let currentChart;
let mostFittest = { fitness: -1 };
let fittestsHistory = [];
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
        legend: {
            enabled: false
        },
        tooltip: {
            animation: false
        },
        credits: {
            enabled: false
        },
        exporting: {
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
    ],
    plotOptions: {
        series: {
            animation: false
        }
    }
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
const clearChart = (chart, categories = true) => {
    if (categories)
        chart.xAxis[0].setCategories([]);
    chart.series[0].setData([]);
    chart.redraw();
};
let args = [
    '64',
    '120'
];
let isPyShellRunning = false;
let pyshell = new python_shell_1.PythonShell('ga.py', {
    scriptPath: path.join(__dirname, 'python'),
    pythonOptions: ['-u'],
    mode: 'json'
});
pyshell.on('message', (args) => {
    if (args['generation'] !== undefined &&
        args['fitness'] !== undefined &&
        args['genes'] !== undefined) {
        progressChart.series[0].addPoint(parseInt(args['fitness']), true, false, false);
        currentChart.series[0].setData(args['genes'], true, false);
        fittestsHistory.push(args['genes']);
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
        fittestsHistory = [];
        mostFittest = { fitness: -1 };
        settingXaxis(args, currentChart, fittestChart);
        setBtnsClickable();
    }
});
pyshell.on('error', (err) => console.error(`error trace: ${err}`));
const play = () => {
    pyshell.send('play');
};
const pause = () => {
    pyshell.send('pause');
};
const stop = () => {
    pyshell.send('stop');
};
const stepForward = () => {
    pyshell.send('step_f');
};
let deleteTimeResult = true;
let close = true;
const switchPlayBtn = () => {
    if (isPyShellRunning) {
        playBtn.querySelector('.play').style.display = 'none';
        playBtn.querySelector('.pause').style.display = 'block';
    }
    else {
        playBtn.querySelector('.play').style.display = 'block';
        playBtn.querySelector('.pause').style.display = 'none';
    }
};
const setBtnsClickable = (clickable = true) => {
    Array.from(document.querySelector('.controls').children).forEach((element, index) => {
        if (index == 0)
            return;
        if (clickable)
            element.classList.remove('disabled-btn');
        else
            element.classList.add('disabled-btn');
        element.disabled = !clickable;
    });
};
playBtn.onclick = () => {
    isPyShellRunning = !isPyShellRunning;
    if (isPyShellRunning) {
        play();
    }
    else {
        pause();
    }
    switchPlayBtn();
};
stopBtn.onclick = () => {
    setBtnsClickable(false);
    stop();
    isPyShellRunning = false;
    switchPlayBtn();
};
toStartBtn.onclick = () => {
    stop();
    play();
    isPyShellRunning = true;
    switchPlayBtn();
};
stepFBtn.onclick = () => {
    stepForward();
    isPyShellRunning = false;
    switchPlayBtn();
};
electron_1.ipcRenderer.on('pyshell', () => {
    pyshell.terminate();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyZW5kZXJlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVDQUF1QztBQUN2QywrQ0FBMkM7QUFDM0MsNkJBQTZCO0FBQzdCLHlDQUF5QztBQUt6QyxJQUFJLE9BQU8sR0FBc0IsUUFBUSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNyRSxJQUFJLE9BQU8sR0FBc0IsUUFBUSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUVyRSxJQUFJLFVBQVUsR0FBc0IsUUFBUSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUk1RSxJQUFJLFFBQVEsR0FBc0IsUUFBUSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBSzlFLElBQUksYUFBK0IsQ0FBQztBQUVwQyxJQUFJLFlBQThCLENBQUM7QUFFbkMsSUFBSSxZQUE4QixDQUFDO0FBSW5DLElBQUksV0FBVyxHQVFYLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFFcEIsSUFBSSxlQUFlLEdBQUcsRUFBRSxDQUFDO0FBRXpCLE1BQU0sU0FBUyxHQUFHLENBQUMsV0FBbUIsRUFBRSxPQUEyQixFQUFFLEVBQUU7SUFDckUsT0FBTyxVQUFVLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRTtRQUNuQyxLQUFLLEVBQUU7WUFDTCxJQUFJLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJO1lBQ3hCLEtBQUssRUFBRTtnQkFDTCxPQUFPLEVBQUUsTUFBTTthQUNoQjtTQUNGO1FBQ0QsS0FBSyxFQUFFO1lBQ0wsS0FBSyxFQUFFO2dCQUNMLElBQUksRUFBNEIsT0FBTyxDQUFDLEtBQU0sQ0FBQyxLQUFLLENBQUMsSUFBSTtnQkFDekQsS0FBSyxFQUFFLE1BQU07YUFDZDtTQUNGO1FBQ0QsS0FBSyxFQUFFO1lBQ0wsS0FBSyxFQUFFO2dCQUNMLElBQUksRUFBNEIsT0FBTyxD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