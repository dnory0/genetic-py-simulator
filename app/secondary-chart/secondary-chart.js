"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ipcRenderer = window.ipcRenderer;
let pyshell = window.pyshell;
let mostFittest = window.mostFittest;
const createChart = (window).createChart;
const enableChartHover = window.enableChartHover;
const clearChart = window
    .clearChart;
const treatResponse = (response) => {
    if (response['generation'] !== undefined &&
        response['fitness'] !== undefined &&
        response['genes'] !== undefined) {
        if (mostFittest['fitness'] < response['fitness']) {
            mostFittest['fitness'] = response['fitness'];
            mostFittest['individuals'] = [
                {
                    generation: response['generation'],
                    genes: response['genes']
                }
            ];
        }
        else if (mostFittest['fitness'] == response['fitness']) {
            mostFittest['individuals'].unshift({
                generation: response['generation'],
                genes: response['genes']
            });
        }
        secondaryChart.series[0].setData(mostFittest.individuals[0].genes, true, false);
    }
    else if (response['started'] && response['genesNum'] !== undefined) {
        clearChart(secondaryChart);
        mostFittest['fitness'] = -1;
        mostFittest['individuals'] = null;
        secondaryChart.xAxis[0].setCategories([...Array(response['genesNum']).keys()].map(v => `${++v}`));
        enableChartHover(false, secondaryChart);
    }
    else if (response['paused'])
        enableChartHover(true, secondaryChart);
    else if (response['resumed'])
        enableChartHover(false, secondaryChart);
};
let secondaryChart = createChart('secondary-chart', {
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
pyshell.stdout.on('data', (response) => {
    response
        .toString()
        .split('\n')
        .forEach((args) => {
        if (args)
            treatResponse(JSON.parse(args));
    });
});
ipcRenderer.send('views-ready');
//# sourceMappingURL=secondary-chart.js.map