"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let liveRendering = { isLive: true, stepForward: false, replay: false };
const ipcRenderer = window['ipcRenderer'];
delete window['ipcRenderer'];
const enableChartHover = window['enableChartHover'];
const clearChart = window['clearChart'];
let treatResponse;
(() => {
    var min;
    var max;
    treatResponse = (response) => {
        if (response['generation'] !== undefined) {
            min = Math.min(min, response['fitness']);
            max = Math.max(max, response['fitness'] + 0.001);
            if (liveRendering.isLive || liveRendering.stepForward)
                primeChart.yAxis[0].setExtremes(min, max, false);
            primeChart.series[0].addPoint(parseInt(response['fitness']), liveRendering.isLive || liveRendering.stepForward, false, false);
            if (response['generation'])
                primeChart.series[1].addPoint([
                    response['generation'] - 0.5,
                    Math.min(response['prv-fitness'], response['fitness']),
                    Math.max(response['prv-fitness'], response['fitness'])
                ], liveRendering.isLive || liveRendering.stepForward, false, false);
            if (liveRendering.stepForward)
                liveRendering.stepForward = false;
        }
        else if (response['started']) {
            min = Number.POSITIVE_INFINITY;
            max = Number.NEGATIVE_INFINITY;
            clearChart(primeChart);
            enableChartHover(response['first-step'], primeChart);
        }
        else if (response['paused'] ||
            response['stopped'] ||
            response['finished']) {
            if (liveRendering.replay)
                liveRendering.replay = false;
            else {
                primeChart.yAxis[0].setExtremes(min, max);
                enableChartHover(true, primeChart);
            }
        }
        else if (response['resumed'])
            enableChartHover(false, primeChart);
    };
})();
let primeChart = window['createChart']('prime-chart', {
    title: {
        text: 'Fittest per Generation'
    },
    xAxis: {
        title: {
            text: 'Generation'
        },
        min: 0,
        labels: {
            enabled: true
        }
    },
    yAxis: {
        title: {
            text: 'Fitness/Deviation'
        },
        tickInterval: 1,
        labels: {
            enabled: true
        },
        gridLineWidth: 1
    },
    tooltip: {
        formatter() {
            return `
          <div style="text-align: right">
            Generation: <b>${!`${this.x}`.match(/\.5$/)
                ? this.x
                : `${this.x - 0.5} - ${this.x + 0.5}`}</b><br>
            <span style="float: left;">
            ${!`${this.x}`.match(/\.5$/) ? 'Fitness' : 'Deviation'}:&nbsp;
            </span>
            <b>${!`${this.x}`.match(/\.5$/)
                ? this.y
                : Math.abs(this.point.high - this.point.low)}</b>
          </div>`;
        },
        positioner(labelWidth, labelHeight, point) {
            return point.plotX + labelWidth + 80 < this.chart.plotWidth
                ? {
                    x: point.plotX,
                    y: point.plotY + 5
                }
                : {
                    x: point.plotX - labelWidth / 1.5 - 6,
                    y: labelHeight + point.plotY
                };
        }
    },
    legend: {
        floating: true,
        itemMarginBottom: -5,
        itemDistance: 10,
        symbolPadding: 2
    },
    series: [
        {
            type: 'line',
            name: 'CGA',
            data: []
        },
        {
            type: 'columnrange',
            name: 'Deviation',
            data: []
        },
        {
            type: 'line',
            name: 'QGA',
            data: []
        }
    ]
});
delete window['createChart'];
window['ready'](treatResponse);
ipcRenderer.on('live-rendering', (_ev, newLR) => (liveRendering.isLive = newLR));
ipcRenderer.on('step-forward', () => (liveRendering.stepForward = true));
ipcRenderer.on('replay', () => (liveRendering.replay = true));
ipcRenderer.on('export', (_ev, actionType) => {
    switch (actionType) {
        case 'png':
            primeChart.exportChartLocal({
                type: 'image/png'
            });
            break;
        case 'jpeg':
            primeChart.exportChartLocal({
                type: 'image/jpeg'
            });
            break;
        case 'svg':
            primeChart.exportChartLocal({
                type: 'image/svg+xml'
            });
            break;
    }
});
//# sourceMappingURL=prime-chart.js.map