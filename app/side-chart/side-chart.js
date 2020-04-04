"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ipcRenderer = window['ipcRenderer'];
delete window['ipcRenderer'];
let mostFittest = { fitness: -1, individuals: null };
const enableChartHover = window['enableChartHover'];
const clearChart = window['clearChart'];
const treatResponse = (response) => {
    if (response['generation'] !== undefined) {
        if (mostFittest['fitness'] < response['fitness']) {
            mostFittest['fitness'] = response['fitness'];
            mostFittest['individuals'] = [
                {
                    generation: response['generation'],
                    genes: response['genes']
                }
            ];
            sideChart.series[1].setData(sideChart.series[0].data.map(aData => [aData.x, 1.5, aData.value]), true, false);
            sideChart.series[0].setData(response['genes'].map((gene, i) => [i, 0.1, gene]), true, false);
        }
        else if (mostFittest['fitness'] == response['fitness']) {
            mostFittest['individuals'].push({
                generation: response['generation'],
                genes: response['genes']
            });
        }
    }
    else if (response['started']) {
        clearChart(sideChart);
        mostFittest['fitness'] = -1;
        mostFittest['individuals'] = null;
        enableChartHover(response['first-step'], sideChart);
    }
    else if (response['paused'] || response['stopped'] || response['finished'])
        enableChartHover(true, sideChart);
    else if (response['resumed'])
        enableChartHover(false, sideChart);
};
let sideChart = window['createChart']('side-chart', {
    title: {
        text: 'Genes'
    },
    xAxis: {
        title: {
            text: 'Gene'
        },
        labels: {
            formatter() {
                return (this.value + 1).toString();
            }
        }
    },
    yAxis: {
        title: {
            text: 'Value'
        },
        tickInterval: 1,
        labels: {
            enabled: false
        },
        gridLineWidth: 0
    },
    tooltip: {
        useHTML: true,
        formatter() {
            return `
        <span><b>${parseInt(this.series.getName().match(/(?<=Series )[0-9]+/)[0]) == 1
                ? 'Fittest'
                : 'Prev Fittest'}:</b></span>
        <span>Gene:&nbsp<b>${this.point.x + 1}</b></span>
        <span>Value:&nbsp<b>${this.point.value}</b></span>
      `;
        },
        positioner: function () {
            return {
                x: 0,
                y: this.chart.chartHeight - this.label.height + 6
            };
        },
        borderWidth: 0,
        backgroundColor: 'transparent',
        shadow: false,
        hideDelay: 250
    },
    legend: {
        enabled: false
    },
    series: [
        {
            type: 'heatmap',
            data: []
        },
        {
            type: 'heatmap',
            data: []
        }
    ]
});
delete window['createChart'];
window['ready'](treatResponse);
ipcRenderer.on('export', (_ev, actionType) => {
    switch (actionType) {
        case 'png':
            sideChart.exportChartLocal({
                type: 'image/png'
            });
            break;
        case 'jpeg':
            sideChart.exportChartLocal({
                type: 'image/jpeg'
            });
            break;
        case 'svg':
            sideChart.exportChartLocal({
                type: 'image/svg+xml'
            });
            break;
    }
});
//# sourceMappingURL=side-chart.js.map