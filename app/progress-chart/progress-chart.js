"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let pyshell = window.pyshell;
const createChart = (window).createChart;
const enableChartHover = window.enableChartHover;
const clearChart = window
    .clearChart;
const treatResponse = (response) => {
    if (response['generation'] !== undefined &&
        response['fitness'] !== undefined &&
        response['genes'] !== undefined) {
        progressChart.series[0].addPoint(parseInt(response['fitness']), true, false, false);
    }
    else if (response['started'] && response['genesNum'] !== undefined) {
        clearChart(progressChart);
        enableChartHover(false, progressChart);
    }
    else if (response['paused'])
        enableChartHover(true, progressChart);
    else if (response['resumed'])
        enableChartHover(false, progressChart);
};
let progressChart = createChart('progress-chart', {
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
        console.log(args);
        if (args)
            treatResponse(JSON.parse(args));
    });
});
//# sourceMappingURL=progress-chart.js.map