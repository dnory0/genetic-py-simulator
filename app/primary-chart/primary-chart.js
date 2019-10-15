"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ipcRenderer = window.ipcRenderer;
const webFrame = window.webFrame;
let pyshell = window.pyshell;
const createChart = (window).createChart;
const enableChartHover = window.enableChartHover;
const clearChart = window
    .clearChart;
const treatResponse = (response) => {
    if (response['generation'] !== undefined &&
        response['fitness'] !== undefined &&
        response['genes'] !== undefined) {
        primaryChart.series[0].addPoint(parseInt(response['fitness']), true, false, false);
    }
    else if (response['started'] && response['genesNum'] !== undefined) {
        clearChart(primaryChart);
        enableChartHover(false, primaryChart);
    }
    else if (response['paused'] || response['finished'])
        enableChartHover(true, primaryChart);
    else if (response['resumed'])
        enableChartHover(false, primaryChart);
};
let primaryChart = createChart('primary-chart', {
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
pyshell.stdout.on('data', (response) => {
    response
        .toString()
        .split('\n')
        .forEach((args) => {
        if (args)
            treatResponse(JSON.parse(args));
    });
});
ipcRenderer.on('zoom', (_event, args) => {
    webFrame.setZoomLevel(args.zoom);
});
webFrame.setZoomLevel(0);
//# sourceMappingURL=primary-chart.js.map