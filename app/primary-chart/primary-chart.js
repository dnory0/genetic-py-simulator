"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ipcRenderer = window['ipcRenderer'];
const enableChartHover = window['enableChartHover'];
const clearChart = window['clearChart'];
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
    else if (response['paused'] || response['finished'] || response['stopped'])
        enableChartHover(true, primaryChart);
    else if (response['resumed'])
        enableChartHover(false, primaryChart);
};
let primaryChart = window['createChart']('primary-chart', {
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
ipcRenderer.on('data', (_event, data) => {
    data
        .toString()
        .split('\n')
        .forEach(args => {
        if (args)
            treatResponse(JSON.parse(args));
    });
});
//# sourceMappingURL=primary-chart.js.map