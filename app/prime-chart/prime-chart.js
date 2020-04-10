"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let liveRendering = { isLive: true, stepForward: false, replay: false };
let isRunning = false;
const ipcRenderer = window['ipcRenderer'];
delete window['ipcRenderer'];
const toggleChartHover = window['toggleChartHover'];
const clearChart = window['clearChart'];
const toggleZoom = window['toggleZoom'];
let treatResponse;
var min = Infinity, max = -Infinity;
let updateExtremes = (newValue) => {
    if (newValue == undefined)
        (min = Infinity), (max = -Infinity);
    else
        (min = Math.min(min, newValue)), (max = Math.max(max, newValue));
};
treatResponse = (response) => {
    if (response['generation'] !== undefined) {
        updateExtremes(response['fitness']);
        if ((liveRendering.isLive || liveRendering.stepForward) &&
            !window['zoomed']) {
            primeChart.yAxis[0].setExtremes(min, max, false);
        }
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
        isRunning = true;
        updateExtremes();
        clearChart(primeChart);
        primeChart.xAxis[0].setExtremes(0, null, true, false);
        window['zoomed'] = false;
        toggleChartHover(primeChart, response['first-step']);
        toggleZoom(primeChart, response['first-step']);
    }
    else if (response['paused'] ||
        response['stopped'] ||
        response['finished']) {
        isRunning = false;
        if (liveRendering.replay)
            liveRendering.replay = false;
        else {
            if (!window['zoomed']) {
                primeChart.yAxis[0].setExtremes(min, max);
            }
            toggleChartHover(primeChart, true);
            toggleZoom(primeChart, true);
        }
    }
    else if (response['resumed']) {
        isRunning = true;
        primeChart.xAxis[0].setExtremes(0, null, true, false);
        window['zoomed'] = false;
        toggleChartHover(primeChart, false);
        toggleZoom(primeChart, false);
    }
};
let primeChart = window['createChart']('prime-chart', {
    chart: {
        events: {
            selection() {
                if (isRunning)
                    return;
                window['zoomed'] = true;
                this.yAxis[0].setExtremes(null, null, false);
                return null;
            }
        }
    },
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
        },
        minRange: 4
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
        useHTML: true,
        formatter() {
            return `
            <span>Generation: <b>${!`${this.x}`.match(/\.5$/)
                ? this.x
                : `${this.x - 0.5} - ${this.x + 0.5}`}</b>
            </span>
            <span>,&nbsp;
            ${!`${this.x}`.match(/\.5$/) ? 'Fitness' : 'Deviation'}:&nbsp;
            <b>${!`${this.x}`.match(/\.5$/)
                ? this.y
                : Math.abs(this.point.high - this.point.low)}</b>
            </span>
          `;
        },
        positioner(labelWidth, labelHeight, point) {
            var x = point.plotX +
                primeChart.chartWidth -
                primeChart.plotWidth -
                (point.plotX + labelWidth + 80 < this.chart.plotWidth
                    ? 4
                    : labelWidth + 4);
            var y = point.plotY + (point.plotY > 30 ? 8 : labelHeight + 50);
            return { x, y };
        },
        shadow: false,
        outside: false,
        hideDelay: 250,
        borderRadius: 0
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
    ],
    plotOptions: {
        series: {
            lineWidth: 1
        }
    }
});
delete window['createChart'];
window['ready'](treatResponse);
ipcRenderer.on('live-rendering', (_ev, newLR) => (liveRendering.isLive = newLR));
ipcRenderer.on('step-forward', () => (liveRendering.stepForward = true));
ipcRenderer.on('replay', () => (liveRendering.replay = true));
ipcRenderer.on('export', (_ev, actionType) => {
    switch (actionType) {
        case 'png':
            alert('disabled for now because of bugs');
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
ipcRenderer.on('zoom-out', () => {
    primeChart.xAxis[0].setExtremes(0, null, false);
    primeChart.yAxis[0].setExtremes(min, max, false);
    primeChart.redraw(true);
    window['zoomed'] = false;
});
//# sourceMappingURL=prime-chart.js.map