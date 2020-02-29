"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const highcharts_1 = require("highcharts");
const path_1 = require("path");
window['ipcRenderer'] = electron_1.ipcRenderer;
window['createChart'] = require(path_1.join(__dirname, '..', 'modules', 'create-chart'));
window['enableChartHover'] = (enable, chart) => {
    chart.update({
        tooltip: {
            enabled: enable
        },
        xAxis: {
            crosshair: enable
        },
        legend: {
            itemStyle: {
                pointerEvents: enable ? 'all' : 'none'
            }
        },
        plotOptions: {
            series: {
                marker: {
                    enabled: enable,
                    radius: enable ? 2 : null
                },
                states: {
                    hover: {
                        halo: {
                            opacity: enable ? 0.5 : 0
                        }
                    }
                }
            }
        }
    }, true, false, false);
};
window['clearChart'] = (chart, categories = false) => {
    if (categories)
        chart.xAxis[0].setCategories([]);
    chart.series[0].setData([], true);
    if (chart.series.length > 1)
        chart.series[2].setData([], true);
};
electron_1.ipcRenderer.once('mode', (_ev, isDev) => {
    if (!isDev)
        return;
    window.addEventListener('keyup', (event) => {
        if (event.code == 'Backquote')
            if (event.ctrlKey)
                if (event.shiftKey)
                    electron_1.ipcRenderer.sendToHost('devTools', 'side');
                else
                    electron_1.ipcRenderer.sendToHost('devTools', 'prime');
    }, true);
});
window.addEventListener('mouseout', () => highcharts_1.charts.forEach(chart => chart.pointer.reset()));
//# sourceMappingURL=chart-preload.js.map