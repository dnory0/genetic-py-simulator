"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let liveRendering = { isLive: true, stepForward: false };
const ipcRenderer = window['ipcRenderer'];
delete window['ipcRenderer'];
const enableChartHover = window['enableChartHover'];
const clearChart = window['clearChart'];
const treatResponse = (response) => {
    if (response['fitness'] !== undefined) {
        primeChart.series[0].addPoint(parseInt(response['fitness']), liveRendering.isLive || liveRendering.stepForward, false, false);
        if (liveRendering.stepForward)
            liveRendering.stepForward = false;
    }
    else if (response['started']) {
        clearChart(primeChart);
        enableChartHover(false, primeChart);
    }
    else if (response['paused'] || response['finished'] || response['stopped'])
        enableChartHover(true, primeChart);
    else if (response['resumed'])
        enableChartHover(false, primeChart);
};
let primeChart = window['createChart']('prime-chart', {
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
            text: 'Fitness'
        },
        tickInterval: 1
    },
    series: [
        {
            name: 'CGA',
            data: []
        }
    ]
});
delete window['createChart'];
ipcRenderer.on('data', (_event, data) => {
    data
        .toString()
        .split(/(?<=\n)/)
        .forEach((args) => treatResponse(JSON.parse(args)));
});
ipcRenderer.on('update-mode', (_ev, newLR) => (liveRendering.isLive = newLR));
ipcRenderer.on('step-forward', () => (liveRendering.stepForward = true));
//# sourceMappingURL=prime-chart.js.map