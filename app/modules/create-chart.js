"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const highcharts_1 = require("highcharts");
const Highcharts = require("highcharts");
const highcharts_more_1 = require("highcharts/highcharts-more");
highcharts_more_1.default(Highcharts);
module.exports = (containerId, options) => {
    delete require.cache[require.resolve('./create-pyshell')];
    return highcharts_1.chart(containerId, {
        chart: {
            spacingBottom: 3
        },
        tooltip: {
            useHTML: true,
            formatter: options.tooltip.formatter
        },
        title: {
            text: options.title.text,
            style: {
                padding: '80px'
            }
        },
        xAxis: {
            crosshair: {
                width: 1
            },
            title: {
                text: options.xAxis.title.text,
                align: 'high'
            },
            tickInterval: 1,
            min: options.xAxis.min
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
                clip: false,
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
        legend: options.legend,
        credits: {
            enabled: false
        }
    });
};
//# sourceMappingURL=create-chart.js.map