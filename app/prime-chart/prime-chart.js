"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let liveRendering = { isLive: true, stepForward: false };
const ipcRenderer = window['ipcRenderer'];
delete window['ipcRenderer'];
const enableChartHover = window['enableChartHover'];
const clearChart = window['clearChart'];
const treatResponse = (response) => {
    if (response['generation'] !== undefined) {
        if (response['fitness'] < primeChart.yAxis[0].getExtremes().min) {
            primeChart.yAxis[0].setExtremes(response['fitness'], primeChart.yAxis[0].getExtremes().max, false);
        }
        if (primeChart.yAxis[0].getExtremes().max < response['fitness']) {
            primeChart.yAxis[0].setExtremes(primeChart.yAxis[0].getExtremes().min, response['fitness'] + 0.05, false);
        }
        primeChart.series[0].addPoint(parseInt(response['fitness']), liveRendering.isLive || liveRendering.stepForward, false, false);
        if (liveRendering.stepForward)
            liveRendering.stepForward = false;
    }
    else if (response['started']) {
        primeChart.yAxis[0].setExtremes(response['fitness'], response['fitness'] + 0.1);
        clearChart(primeChart);
        enableChartHover(response['first-step'], primeChart);
    }
    else if (response['paused'] || response['stopped'] || response['finished'])
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
ipcRenderer.on('data', (_event, data) => treatResponse(data));
ipcRenderer.on('update-mode', (_ev, newLR) => (liveRendering.isLive = newLR));
ipcRenderer.on('step-forward', () => (liveRendering.stepForward = true));
//# sourceMappingURL=prime-chart.js.map