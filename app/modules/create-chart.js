"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const highcharts_1 = require("highcharts");
module.exports = (containerId, options) => {
    delete require.cache[require.resolve('./create-pyshell')];
    return highcharts_1.chart(containerId, {
        chart: {},
        title: {
            text: options.title.text,
            style: {
                padding: '80px'
            }
        },
        xAxis: {
            tickInterval: 1,
            title: {
                text: options.xAxis.title.text,
                align: 'high'
            }
        },
        yAxis: {
            title: null,
            tickInterval: 1,
            endOnTick: false
        },
        series: options.series,
        plotOptions: {
            line: {
                lineWidth: 1.5
            },
            series: {
                animation: false,
                states: {
                    hover: {
                        halo: {
                            opacity: 0
                        }
                    }
                }
            }
        },
        subtitle: {
            text: options.yAxis.title.text,
            align: 'left'
        },
        legend: {
            enabled: false
        },
        credits: {
            enabled: false
        }
    });
};
//# sourceMappingURL=create-chart.js.map