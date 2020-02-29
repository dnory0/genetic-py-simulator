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
        }
        else if (mostFittest['fitness'] == response['fitness']) {
            mostFittest['individuals'].unshift({
                generation: response['generation'],
                genes: response['genes']
            });
        }
        sideChart.series[0].setData(mostFittest.individuals[0].genes, true, false);
        sideChart2.series[0].setData(mostFittest.individuals[0].genes, true, false);
    }
    else if (response['started']) {
        clearChart(sideChart);
        clearChart(sideChart2);
        mostFittest['fitness'] = -1;
        mostFittest['individuals'] = null;
        sideChart.xAxis[0].setCategories([...Array(response['genesNum']).keys()].map(v => `${++v}`));
        sideChart2.xAxis[0].setCategories([...Array(response['genesNum']).keys()].map(v => `${++v}`));
        enableChartHover(response['first-step'], sideChart);
        enableChartHover(response['first-step'], sideChart2);
    }
    else if (response['paused'] ||
        response['stopped'] ||
        response['finished']) {
        enableChartHover(true, sideChart);
        enableChartHover(true, sideChart2);
    }
    else if (response['resumed']) {
        enableChartHover(false, sideChart);
        enableChartHover(false, sideChart2);
    }
};
let sideChart = window['createChart']('side-chart', {
    chart: {
        type: 'line'
    },
    title: {
        text: null
    },
    xAxis: {
        title: {
            text: null
        }
    },
    yAxis: {
        title: {
            text: null
        },
        tickInterval: 1
    },
    tooltip: {
        formatter() {
            return `
          <div style="text-align: right">
            Gene: <b>${this.x}</b><br>
            <span style="float: left;">
              Value:&nbsp;
            </span>
            <b>${this.y}</b>
          </div>`;
        }
    },
    legend: {
        enabled: false
    },
    series: [
        {
            data: []
        }
    ]
});
let sideChart2 = window['createChart']('side-chart2', {
    chart: {
        type: 'line'
    },
    title: {
        text: null
    },
    xAxis: {
        title: {
            text: null
        }
    },
    yAxis: {
        title: {
            text: null
        },
        tickInterval: 1
    },
    tooltip: {
        formatter() {
            return `
          <div style="text-align: right">
            Gene: <b>${this.x}</b><br>
            <span style="float: left;">
              Value:&nbsp;
            </span>
            <b>${this.y}</b>
          </div>`;
        }
    },
    legend: {
        enabled: false
    },
    series: [
        {
            color: 'red',
            data: []
        }
    ]
});
delete window['createChart'];
['mousemove', 'touchmove', 'touchstart'].forEach(function (eventType) {
    document
        .getElementById('charts-container')
        .addEventListener(eventType, function (e) {
        var chart, point, i, event;
        for (i = 0; i < 2; i = i + 1) {
            chart = [sideChart, sideChart2][i];
            event = chart.pointer.normalize(e);
            point = chart.series[0].searchPoint(event, true);
            if (point) {
                point.highlight(e);
            }
        }
    });
});
let charts = [sideChart, sideChart2];
window['sync-charts']();
['mousemove', 'touchmove', 'touchstart'].forEach(function (eventType) {
    document
        .getElementById('charts-container')
        .addEventListener(eventType, function (e) {
        var chart, point, i, event;
        for (i = 0; i < charts.length; i = i + 1) {
            chart = charts[i];
            event = chart.pointer.normalize(e);
            point = chart.series[0].searchPoint(event, true);
            if (point) {
                point.highlight(e);
            }
        }
    });
});
ipcRenderer.on('data', (_event, response) => treatResponse(response));
//# sourceMappingURL=side-chart.js.map