"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const highcharts_1 = require("highcharts");
window.initChart = (containerId, options) => {
    return highcharts_1.chart(containerId, {
        title: {
            text: options.title.text,
            style: {
                padding: '80px'
            }
        },
        xAxis: {
            title: {
                text: options.xAxis.title.text,
                align: 'high'
            }
        },
        yAxis: {
            title: {
                text: options.yAxis.title.text,
                align: 'high',
                rotation: 0,
                y: -20,
                x: -5,
                offset: -35
            }
        },
        series: options.series,
        plotOptions: {
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
        legend: {
            enabled: false
        },
        credits: {
            enabled: false
        }
    });
};
//# sourceMappingURL=preload.js.map