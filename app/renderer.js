"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var python_shell_1 = require("python-shell");
var path = require("path");
var Highcharts = require("highcharts");
require('highcharts/modules/exporting')(Highcharts);
var playBtn = document.getElementById('play-btn');
var stopBtn = document.getElementById('stop-btn');
var toStartBtn = document.getElementById('to-start-btn');
var stepFBtn = document.getElementById('step-forward-btn');
var isPyShellRunning = false;
var progressChart;
var fittestChart;
var currentChart;
var initChart = function (containerId, options) {
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
var mostFittestInds = { 0: [] };
var fittestsHistory = [];
var clearChart = function (chart, labels) {
    if (labels === void 0) { labels = true; }
    if (labels)
        chart.xAxis[0].setCategories([]);
    chart.series[0].setData([]);
    chart.redraw();
};
var pyshell = new python_shell_1.PythonShell('ga.py', {
    scriptPath: path.join(__dirname, 'python'),
    pythonOptions: ['-u'],
    mode: 'json'
});
pyshell.on('message', function (args) {
    if (args['generation'] !== undefined &&
        args['fitness'] !== undefined &&
        args['genes'] !== undefined) {
        progressChart.series[0].addPoint(parseInt(args['fitness']), true, false, false);
    }
    else if (args['started'] && args['genesNum'] !== undefined) {
        clearChart(progressChart);
        clearChart(fittestChart);
        clearChart(currentChart);
        setBtnsClickable();
    }
});
pyshell.on('error', function (err) { return console.error("error trace: " + err); });
var play = function () {
    pyshell.send('play');
};
var pause = function () {
    pyshell.send('pause');
};
var stop = function () {
    pyshell.send('stop');
};
var stepForward = function () {
    pyshell.send('step_f');
};
var deleteTimeResult = true;
var close = true;
var switchPlayBtn = function () {
    if (isPyShellRunning) {
        playBtn.querySelector('.play').style.display = 'none';
        playBtn.querySelector('.pause').style.display = 'block';
    }
    else {
        playBtn.querySelector('.play').style.display = 'block';
        playBtn.querySelector('.pause').style.display = 'none';
    }
};
var setBtnsClickable = function (clickable) {
    if (clickable === void 0) { clickable = true; }
    Array.from(document.querySelector('.controls').children).forEach(function (element, index) {
        if (index == 0)
            return;
        if (clickable)
            element.classList.remove('disabled-btn');
        else
            element.classList.add('disabled-btn');
        element.disabled = !clickable;
    });
};
playBtn.onclick = function () {
    isPyShellRunning = !isPyShellRunning;
    if (isPyShellRunning) {
        play();
    }
    else {
        pause();
    }
    switchPlayBtn();
};
stopBtn.onclick = function () {
    setBtnsClickable(false);
    stop();
    isPyShellRunning = false;
    switchPlayBtn();
};
toStartBtn.onclick = function () {
    stop();
    play();
    isPyShellRunning = true;
    switchPlayBtn();
};
stepFBtn.onclick = function () {
    stepForward();
    isPyShellRunning = false;
    switchPlayBtn();
};
electron_1.ipcRenderer.on('pyshell', function () {
    pyshell.terminate();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyZW5kZXJlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFDQUFpRDtBQUNqRCw2Q0FBMkM7QUFDM0MsMkJBQTZCO0FBQzdCLHVDQUF5QztBQUN6QyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUdwRCxJQUFJLE9BQU8sR0FBc0IsUUFBUSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNyRSxJQUFJLE9BQU8sR0FBc0IsUUFBUSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUVyRSxJQUFJLFVBQVUsR0FBc0IsUUFBUSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUk1RSxJQUFJLFFBQVEsR0FBc0IsUUFBUSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBTzlFLElBQUksZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO0FBSzdCLElBQUksYUFBK0IsQ0FBQztBQUVwQyxJQUFJLFlBQThCLENBQUM7QUFFbkMsSUFBSSxZQUE4QixDQUFDO0FBRW5DLElBQU0sU0FBUyxHQUFHLFVBQUMsV0FBbUIsRUFBRSxPQUEyQjtJQUNqRSxPQUFPLFVBQVUsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFO1FBQ25DLEtBQUssRUFBRTtZQUNMLElBQUksRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUk7WUFDeEIsS0FBSyxFQUFFO2dCQUNMLE9BQU8sRUFBRSxNQUFNO2FBQ2hCO1NBQ0Y7UUFDRCxLQUFLLEVBQUU7WUFDTCxLQUFLLEVBQUU7Z0JBQ0wsSUFBSSxFQUE0QixPQUFPLENBQUMsS0FBTSxDQUFDLEtBQUssQ0FBQyxJQUFJO2dCQUN6RCxLQUFLLEVBQUUsTUFBTTthQUNkO1NBQ0Y7UUFDRCxLQUFLLEVBQUU7WUFDTCxLQUFLLEVBQUU7Z0JBQ0wsSUFBSSxFQUE0QixPQUFPLENBQUMsS0FBTSxDQUFDLEtB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