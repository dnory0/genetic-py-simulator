"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const highstock_1 = require("highcharts/highstock");
module.exports = (containerId, options) => {
    delete require.cache[require.resolve('./create-pyshell')];
    return highstock_1.stockChart(containerId, {
        title: {
            text: options.title.text,
            style: {
                padding: '80px'
            }
        },
        subtitle: {
            text: options.yAxis.title.text,
            align: 'left'
        },
        xAxis: {
            crosshair: false,
            title: {
                text: options.xAxis.title.text,
                align: 'high'
            },
            type: 'category',
            labels: {
                formatter: function () {
                    return this.value;
                }
            }
        },
        yAxis: {
            minRange: 1,
            opposite: false
        },
        rangeSelector: {
            inputEnabled: false,
            buttons: [
                {
                    text: '10',
                    count: 10,
                    type: 'millisecond'
                },
                {
                    text: '50',
                    count: 50,
                    type: 'millisecond'
                },
                {
                    text: '100',
                    count: 100,
                    type: 'millisecond'
                },
                {
                    text: '200',
                    count: 200,
                    type: 'millisecond'
                },
                {
                    text: 'all',
                    type: 'all'
                }
            ],
            allButtonsEnabled: false,
            buttonPosition: {
                align: 'right',
                x: -30,
                y: -30
            },
            labelStyle: {
                fontSize: '0px'
            }
        },
        series: options.series,
        navigator: {
            xAxis: {
                labels: {
                    formatter: function () {
                        return this.value;
                    }
                }
            },
            margin: 5,
            height: 30
        },
        scrollbar: {
            enabled: false
        },
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
        tooltip: {
            formatter: function () {
                return (`${options.xAxis.title.text} <b>` +
                    this.x +
                    `</b><br>${options.yAxis.title.text} <b>` +
                    this.y +
                    '</b>');
            }
        },
        boost: {
            allowForce: true,
            enabled: true,
            useGPUTranslations: true
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