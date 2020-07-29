"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ipcRenderer = window['ipcRenderer'];
delete window['ipcRenderer'];
let mostFittest = { fitness: -1, individuals: null };
const toggleChartHover = window['toggleChartHover'];
const clearChart = window['clearChart'];
const toggleZoom = window['toggleZoom'];
const treatResponse = (response) => {
    if (response['generation'] !== undefined) {
        if (mostFittest['fitness'] < response['fitness']) {
            mostFittest['fitness'] = response['fitness'];
            mostFittest['individuals'] = [
                {
                    generation: response['generation'],
                    genes: response['genes'],
                },
            ];
            sideChart.series[0].setData(sideChart.series[1].data.map(aData => [aData.x, 0.5, aData.value]), true, false);
            sideChart.series[1].setData(response['genes'].map((gene, i) => [i, 2.5, gene]), true, false);
        }
        else if (mostFittest['fitness'] == response['fitness']) {
            mostFittest['individuals'].push({
                generation: response['generation'],
                genes: response['genes'],
            });
        }
    }
    else if (response['started']) {
        clearChart(sideChart);
        sideChart.xAxis[0].setExtremes(null, null, true, true);
        mostFittest['fitness'] = -1;
        mostFittest['individuals'] = null;
        toggleChartHover(sideChart, response['first-step']);
        toggleZoom(sideChart, response['first-step']);
    }
    else if (response['paused'] || response['stopped'] || response['finished']) {
        toggleChartHover(sideChart, true);
        toggleZoom(sideChart, true);
    }
    else if (response['resumed']) {
        sideChart.xAxis[0].setExtremes(0, null, true, false);
        toggleChartHover(sideChart, false);
        toggleZoom(sideChart, false);
    }
};
let sideChart = window['createChart']('side-chart', {
    chart: {
        events: {},
    },
    title: {
        text: 'Genes',
    },
    xAxis: {
        title: {
            text: 'Gene',
        },
        min: 0,
        labels: {
            formatter() {
                return (this.value + 1).toString();
            },
        },
        minRange: 4,
    },
    yAxis: {
        title: {
            text: 'Value',
        },
        tickInterval: 1,
        labels: {
            enabled: false,
        },
        gridLineWidth: 0,
    },
    tooltip: {
        useHTML: true,
        formatter() {
            return `
        <span><b>${this.series.getName() == 'F' ? 'Fittest' : 'Prev Fittest'}:</b></span>
        <span>Gene:&nbsp<b>${this.point.x + 1}</b></span>
        <span>,&nbsp;Value:&nbsp<b>${this.point.value}</b></span>
      `;
        },
        positioner(labelWidth, labelHeight, point) {
            point = point;
            var x = point.plotX + labelWidth + 80 < sideChart.plotWidth ? point.plotX + 9 : point.plotX - (labelWidth - 9);
            var y = point.plotY + (point.plotY > 30 ? 8 : labelHeight + 50);
            return { x, y };
        },
        shadow: false,
        outside: false,
        hideDelay: 250,
        borderRadius: 0,
    },
    legend: {
        enabled: false,
    },
    series: [
        {
            name: 'PF',
            type: 'heatmap',
            data: [],
        },
        {
            name: 'F',
            type: 'heatmap',
            data: [],
        },
    ],
    plotOptions: {
        series: {
            lineWidth: 0,
        },
    },
});
delete window['createChart'];
window['ready'](treatResponse);
ipcRenderer.on('export', (_ev, actionType) => {
    switch (actionType) {
        case 'png':
            alert('disabled for now because of bugs');
            break;
        case 'jpeg':
            sideChart.exportChartLocal({
                type: 'image/jpeg',
            });
            break;
        case 'svg':
            sideChart.exportChartLocal({
                type: 'image/svg+xml',
            });
            break;
    }
});
ipcRenderer.on('zoom-out', () => {
    sideChart.xAxis[0].setExtremes(null, null, true, true);
});
//# sourceMappingURL=side-chart.js.map