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
        formatter() {
            return `
      <div style="width: 80px">
        <div><b>${Number.parseInt(this.series.getName().match(/(?<=Series )[0-9]+/)[0]) == 1
                ? 'Fittest'
                : 'Prev Fittest'}:</b></div>
        <div>Gene:&nbsp<b style="float: right">${this.point.x + 1}</b></div>
        <div>Value:&nbsp<b style="float: right">${this.point.value}</b></div>
      </div>`;
        }
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
ipcRenderer.on('data', (_event, response) => treatResponse(response));
//# sourceMappingURL=side-chart.js.map