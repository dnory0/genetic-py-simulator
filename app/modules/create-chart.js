"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const highcharts_1 = require("highcharts");
module.exports = (containerId, options) => {
    delete require.cache[require.resolve('./create-chart')];
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
            min: options.xAxis.min,
            labels: options.xAxis.labels
        },
        colorAxis: {
            minColor: highcharts_1.getOptions().colors[2],
            maxColor: highcharts_1.getOptions().colors[8]
        },
        yAxis: {
            title: null,
            tickInterval: 1,
            endOnTick: false,
            labels: options.yAxis.labels,
            gridLineWidth: options.yAxis.gridLineWidth
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