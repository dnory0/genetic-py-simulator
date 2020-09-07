"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const Highcharts = require("highcharts");
const path_1 = require("path");
const exporting_1 = require("highcharts/modules/exporting");
const offline_exporting_1 = require("highcharts/modules/offline-exporting");
const export_data_1 = require("highcharts/modules/export-data");
exporting_1.default(Highcharts);
offline_exporting_1.default(Highcharts);
export_data_1.default(Highcharts);
const { getGlobal } = electron_1.remote;
window['ipcRenderer'] = electron_1.ipcRenderer;
window['createChart'] = require(path_1.join(__dirname, '..', 'modules', 'create-chart'));
window['toggleChartHover'] = (chart, enable) => {
    chart.update(chart.container.parentElement.id == 'prime-chart'
        ? {
            tooltip: {
                enabled: enable,
            },
            xAxis: {
                crosshair: enable,
            },
            legend: {
                itemStyle: {
                    pointerEvents: enable ? 'all' : 'none',
                },
                itemCheckboxStyle: {
                    pointerEvents: enable ? 'all' : 'none',
                },
            },
            plotOptions: {
                series: {
                    marker: {
                        enabled: enable,
                        radius: enable ? 1.5 : null,
                    },
                    states: {
                        hover: {
                            halo: {
                                opacity: enable ? 0.5 : 0,
                            },
                        },
                    },
                },
            },
        }
        : {
            tooltip: {
                enabled: enable,
            },
        }, true, false, false);
};
window['clearChart'] = (chart, categories = false) => {
    if (categories)
        chart.xAxis[0].setCategories([]);
    chart.series.forEach(serie => serie.setData([], true));
};
if (getGlobal('isDev'))
    window.addEventListener('keyup', (event) => {
        if (event.code == 'Backquote')
            if (event.ctrlKey)
                if (event.shiftKey)
                    electron_1.ipcRenderer.sendToHost('devTools', 'side');
                else
                    electron_1.ipcRenderer.sendToHost('devTools', 'prime');
    }, true);
window['ready'] = (treatResponse) => {
    delete window['ready'];
    getGlobal('pyshell').stdout.on('data', (response) => {
        response
            .toString()
            .split(/(?<=\n)/g)
            .map((data) => JSON.parse(data))
            .forEach((data) => treatResponse(data));
    });
};
window['toggleZoom'] = (chart, enable) => {
    if (window['zoomed'])
        return;
    chart.update({
        chart: {
            zoomType: enable ? 'x' : null,
            panning: {
                enabled: enable,
            },
        },
    }, true, false, false);
};
//# sourceMappingURL=chart-preload.js.map