"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
window['ipcRenderer'] = electron_1.ipcRenderer;
window['createChart'] = require('./create-chart');
window['enableChartHover'] = (enable, chart) => {
    chart.options.tooltip.enabled = enable;
    chart.update({
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
    });
};
window['clearChart'] = (chart, categories = false) => {
    if (categories)
        chart.xAxis[0].setCategories([]);
    chart.series[0].setData([], true);
};
//# sourceMappingURL=chart-preload.js.map