"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
window['ipcRenderer'] = electron_1.ipcRenderer;
window['createChart'] = require(path_1.join(__dirname, '..', 'modules', 'create-chart'));
window['enableChartHover'] = (enable, chart) => {
    chart.update({
        tooltip: {
            enabled: enable
        },
        navigator: {
            enabled: enable
        },
        xAxis: {
            crosshair: enable
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
//# sourceMappingURL=chart-preload.js.map