"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ipcRenderer = window['ipcRenderer'];
delete window['ipcRenderer'];
let mostFittest = { fitness: -1, individuals: null };
const enableChartHover = window['enableChartHover'];
const clearChart = window['clearChart'];
const treatResponse = (response) => {
    if (response['fitness'] !== undefined) {
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
        sideChart.series[0].setData(mostFittest.individuals[0].genes, true, false);
    }
    else if (response['started']) {
        clearChart(sideChart);
        mostFittest['fitness'] = -1;
        mostFittest['individuals'] = null;
        sideChart.xAxis[0].setCategories([...Array(response['genesNum']).keys()].map(v => `${++v}`));
        enableChartHover(response['first-step'], sideChart);
    }
    else if (response['paused'] || response['stopped'] || response['finished'])
        enableChartHover(true, sideChart);
    else if (response['resumed'])
        enableChartHover(false, sideChart);
};
let sideChart = window['createChart']('side-chart', {
    chart: {
        type: 'line'
    },
    title: {
        text: 'Best Fittest Genes'
    },
    xAxis: {
        title: {
            text: 'Position'
        }
    },
    yAxis: {
        title: {
            text: 'Gene'
        },
        tickInterval: 1,
        endOnTick: false
    },
    series: [
        {
            data: []
        }
    ]
});
delete window['createChart'];
ipcRenderer.on('data', (_event, response) => treatResponse(response));
//# sourceMappingURL=side-chart.js.map