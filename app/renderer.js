"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var python_shell_1 = require("python-shell");
var path = require("path");
var Chart = require("chart.js");
var playBtn = document.getElementById('play-btn');
var stopBtn = document.getElementById('stop-btn');
var toStartBtn = document.getElementById('to-start-btn');
var stepBBtn = document.getElementById('step-back-btn');
var stepFBtn = document.getElementById('step-forward-btn');
var args = [
    '64',
    '120'
];
var isPyShellRunning = false;
var progressChart;
var fittestChart;
var currentChart;
var initChart = function (canvas, _a) {
    var _b = _a.options, text = _b.title.text, duration = _b.animation.duration, devicePixelRatio = _b.devicePixelRatio;
    return new Chart(canvas, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Progress',
                    fill: 'rgba(0,0,0,0)',
                    backgroundColor: '#3572A5',
                    borderColor: '#3572A5',
                    borderWidth: 2,
                    lineTension: 0
                }
            ]
        },
        options: {
            title: {
                display: true,
                position: 'top',
                text: text
            },
            animation: {
                duration: duration ? duration : 0
            },
            devicePixelRatio: devicePixelRatio ? devicePixelRatio : 2,
            elements: {
                point: {
                    borderWidth: 3
                }
            },
            tooltips: {
                enabled: false
            }
        }
    });
};
var progressCtx = document.getElementById('progress-chart');
progressChart = initChart(progressCtx, {
    options: {
        title: {
            text: 'Fittest Fitness per Generation'
        },
        maintainAspectRatio: false,
        responsive: true,
        animation: {
            duration: 100
        }
    }
});
var fittestCtx = document.getElementById('fittest-chart');
fittestChart = initChart(fittestCtx, {
    options: {
        title: {
            text: 'Best Fittest Genes'
        },
        animation: {
            duration: 200
        }
    }
});
var currentCtx = document.getElementById('current-chart');
currentChart = initChart(currentCtx, {
    options: {
        title: {
            text: 'Current Generation Fittest Genes'
        },
        animation: {
            duration: 0
        }
    }
});
var activateTooltips = function (chart) {
};
var clearChart = function (chart) {
    chart.data.labels = [];
    chart.data.datasets[0].data = [];
    chart.update();
};
var pyshell = new python_shell_1.PythonShell('ga.py', {
    scriptPath: path.join(__dirname, 'python'),
    pythonOptions: ['-u'],
    mode: 'json'
});
pyshell.on('message', function (args) {
    if (args['generation'] && args['fitness']) {
        progressChart.data.labels.push("" + args['generation']);
        progressChart.data.datasets[0].data.push(parseInt(args['fitness']));
        progressChart.update();
    }
    else if (args['started']) {
        clearChart(progressChart);
        clearChart(fittestChart);
        clearChart(currentChart);
    }
});
pyshell.on('error', function (err) { return console.error("error trace: " + err); });
pyshell.on('close', function () { return console.log('closed'); });
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
var blinkPlayBtn = function () {
    playBtn.classList.add('disabled-btn');
    playBtn.disabled = true;
    setTimeout(function () {
        playBtn.classList.remove('disabled-btn');
        playBtn.disabled = false;
    }, 400);
};
playBtn.onclick = function () {
    isPyShellRunning = !isPyShellRunning;
    if (isPyShellRunning) {
        play();
        setBtnsClickable();
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
    switchPlayBtn();
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyZW5kZXJlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLDZDQUEyQztBQUMzQywyQkFBNkI7QUFDN0IsZ0NBQWtDO0FBRWxDLElBQUksT0FBTyxHQUFzQixRQUFRLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3JFLElBQUksT0FBTyxHQUFzQixRQUFRLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBRXJFLElBQUksVUFBVSxHQUFzQixRQUFRLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBRTVFLElBQUksUUFBUSxHQUFzQixRQUFRLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBRTNFLElBQUksUUFBUSxHQUFzQixRQUFRLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFFOUUsSUFBSSxJQUFJLEdBQUc7SUFDVCxJQUFJO0lBQ0osS0FBSztDQUNOLENBQUM7QUFFRixJQUFJLGdCQUFnQixHQUFHLEtBQUssQ0FBQztBQUs3QixJQUFJLGFBQW9CLENBQUM7QUFFekIsSUFBSSxZQUFtQixDQUFDO0FBRXhCLElBQUksWUFBbUIsQ0FBQztBQUV4QixJQUFNLFNBQVMsR0FBRyxVQUNoQixNQUF5QixFQUN6QixFQU0yQjtRQUx6QixlQUlDLEVBSFUsb0JBQUksRUFDQSxnQ0FBUSxFQUNyQixzQ0FBZ0I7SUFJcEIsT0FBTyxJQUFJLEtBQUssQ0FBQyxNQUFNLEVBQUU7UUFDdkIsSUFBSSxFQUFFLE1BQU07UUFDWixJQUFJLEVBQUU7WUFDSixRQUFRLEVBQUU7Z0JBQ1I7b0JBQ0UsS0FBSyxFQUFFLFVBQVU7b0JBQ2pCLElBQUksRUFBRSxlQUFlO29CQUNyQixlQUFlLEVBQUUsU0FBUztvQkFDMUIsV0FBVyxFQUFFLFNBQVM7b0JBQ3RCLFdBQVcsRUFBRSxDQUFDO29CQUVkLFdBQVcsRUFBRSxDQUFDO2lCQUNmO2FBQ0Y7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