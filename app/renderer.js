"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const python_shell_1 = require("python-shell");
const path = require("path");
const Chart = require("chart.js");
let playBtn = document.getElementById('play-btn');
let stopBtn = document.getElementById('stop-btn');
let backToStartBtn = (document.getElementById('back-to-start-btn'));
let stepForwardBtn = (document.getElementById('step-forward-btn'));
let args = [
    '64',
    '120'
];
let isPyShellRunning = false;
let pyshell;
let progressChart;
let fittestChart;
let genesNum;
let deleteResult = true;
let close = true;
electron_1.webFrame.setZoomLevel(0);
electron_1.webFrame.setZoomFactor(1);
const createChart = (canvas, { options: { title: { text }, animation: { duration }, devicePixelRatio } }) => {
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
                position: 'bottom',
                text
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
const terminatePyShell = (callbackfn) => {
    isPyShellRunning = false;
    console.log('closed here');
    pyshell.end(() => {
        if (callbackfn)
            callbackfn();
    });
};
const activateTooltips = (chart) => {
    chart.options.tooltips.enabled = !isPyShellRunning;
};
const clearChart = (chart) => {
    chart.data.labels = [];
    chart.data.datasets[0].data = [];
    chart.update();
};
const startPythonShell = () => {
    close = false;
    clearChart(progressChart);
    clearChart(fittestChart);
    pyshell = new python_shell_1.PythonShell('ga.py', {
        scriptPath: path.join(__dirname, 'python'),
        pythonOptions: ['-u'],
        args: args,
        mode: 'json'
    });
    pyshell.on('message', (...args) => console.log(args[0]));
    pyshell.on('error', err => console.error(`error trace: ${err}`));
    pyshell.on('close', () => console.log('closed: '));
};
const switchPlayPauseBtn = () => {
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
const blinkPlayBtn = () => {
    playBtn.classList.add('disabled-btn');
    playBtn.disabled = true;
    setTimeout(() => {
        playBtn.classList.remove('disabled-btn');
        playBtn.disabled = false;
    }, 400);
};
const resetTime = (v = false) => {
    notifyTimer('finish');
    deleteResult = v;
};
const notifyTimer = (state) => {
    electron_1.ipcRenderer.send('time', state);
};
let progressCtx = document.getElementById('progress-chart');
progressChart = createChart(progressCtx, {
    options: {
        title: {
            text: 'Fittest For every Generation'
        },
        maintainAspectRatio: false,
        responsive: true,
        animation: {
            duration: 100
        }
    }
});
let fittestCtx = document.getElementById('fittest-chart');
fittestChart = createChart(fittestCtx, {
    options: {
        title: {
            text: 'Fittest Individual Genes'
        },
        animation: {
            duration: 200
        }
    }
});
playBtn.onclick = () => {
    isPyShellRunning = !isPyShellRunning;
    if (!pyshell) {
        clearChart(progressChart);
        startPythonShell();
        switchPlayPauseBtn();
        setBtnsClickable();
        notifyTimer('start');
    }
    else {
        if (isPyShellRunning) {
            pyshell.send('');
            notifyTimer('resume');
            switchPlayPauseBtn();
        }
        else {
            notifyTimer('pause');
            switchPlayPauseBtn();
        }
    }
    activateTooltips(progressChart);
};
stopBtn.onclick = () => {
    resetTime(true);
    clearChart(progressChart);
    clearChart(fittestChart);
    setBtnsClickable(false);
    terminatePyShell();
    switchPlayPauseBtn();
};
backToStartBtn.onclick = () => {
    close = true;
    terminatePyShell(() => {
        resetTime(true);
        playBtn.click();
    });
};
stepForwardBtn.onclick = () => {
    if (isPyShellRunning)
        playBtn.click();
    pyshell.send('');
};
electron_1.ipcRenderer.on('time', (_event, time) => {
    document.getElementById('time').innerHTML = time;
});
electron_1.ipcRenderer.on('cpuusage', (_event, cpuusage) => {
    document.getElementById('cpuusage').innerHTML = cpuusage;
});
electron_1.ipcRenderer.on('time-finished', () => {
    if (deleteResult)
        document.getElementById('time').innerHTML = '00:00:00:00';
});
notifyTimer('finish');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyZW5kZXJlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVDQUFpRDtBQUNqRCwrQ0FBMkM7QUFDM0MsNkJBQTZCO0FBQzdCLGtDQUFrQztBQUVsQyxJQUFJLE9BQU8sR0FBc0IsUUFBUSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNyRSxJQUFJLE9BQU8sR0FBc0IsUUFBUSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNyRSxJQUFJLGNBQWMsR0FBc0IsQ0FDdEMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUM3QyxDQUFDO0FBRUYsSUFBSSxjQUFjLEdBQXNCLENBQ3RDLFFBQVEsQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQUMsQ0FDNUMsQ0FBQztBQUVGLElBQUksSUFBSSxHQUFHO0lBQ1QsSUFBSTtJQUNKLEtBQUs7Q0FDTixDQUFDO0FBRUYsSUFBSSxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7QUFFN0IsSUFBSSxPQUFvQixDQUFDO0FBRXpCLElBQUksYUFBb0IsQ0FBQztBQUV6QixJQUFJLFlBQW1CLENBQUM7QUFLeEIsSUFBSSxRQUFrQixDQUFDO0FBR3ZCLElBQUksWUFBWSxHQUFZLElBQUksQ0FBQztBQUVqQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7QUFHakIsbUJBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekIsbUJBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFLMUIsTUFBTSxXQUFXLEdBQUcsQ0FDbEIsTUFBeUIsRUFDekIsRUFDRSxPQUFPLEVBQUUsRUFDUCxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFDZixTQUFTLEVBQUUsRUFBRSxRQUFRLEVBQUUsRUFDdkIsZ0JBQWdCLEVBQ2pCLEVBQ3dCLEVBQzNCLEVBQUU7SUFDRixPQUFPLElBQUksS0FBSyxDQUFDLE1B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