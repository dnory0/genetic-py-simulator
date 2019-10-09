"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let pyshell = window.pyshell;
let mostFittest = window.mostFittest;
const createChart = (window).createChart;
const enableChartHover = window.enableChartHover;
const clearChart = window
    .clearChart;
const settingXAxis = window
    .settingXAxis;
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
        fittestChart.series[0].setData(mostFittest.individuals[0].genes, true, false);
    }
    else if (response['started'] && response['genesNum'] !== undefined) {
        clearChart(fittestChart);
        settingXAxis(response, fittestChart);
        enableChartHover(false, fittestChart);
    }
    else if (response['paused'])
        enableChartHover(true, fittestChart);
    else if (response['resumed'])
        enableChartHover(false, fittestChart);
};
let fittestChart = createChart('fittest-chart', {
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
    treatResponse(JSON.parse(response.toString()));
    response
        .toString()
        .split('\n')
        .forEach((args) => {
        if (args)
            treatResponse(JSON.parse(args));
    });
});
//# sourceMappingURL=fittest-chart.js.map