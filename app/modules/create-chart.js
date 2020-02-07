"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const highstock_1 = require("highcharts/highstock");
module.exports = (containerId, options) => {
    delete require.cache[require.resolve('./create-chart')];
    var chartSVG;
    let chart = highstock_1.stockChart(containerId, {
        chart: {
            events: {
                redraw: () => {
                    var yAxisLabels = document.getElementsByClassName('highcharts-yaxis-labels')[0].children;
                    if (yAxisLabels == null || !yAxisLabels.length)
                        return;
                    var matrix = chartSVG.createSVGMatrix();
                    var driftedLabel = (Array.from(yAxisLabels).filter((textEle) => textEle.y.baseVal.getItem(0).value < 0)[0]);
                    driftedLabel.x.baseVal.getItem(0).value = (yAxisLabels[0]).x.baseVal.getItem(0).value;
                    var y = 9999;
                    Array.from((document.querySelectorAll('.highcharts-grid.highcharts-yaxis-grid > .highcharts-grid-line'))).forEach((path) => (y = y < path.getBBox().y ? y : path.getBBox().y));
                    matrix = matrix.translate(0, 9996 + y);
                    driftedLabel.transform.baseVal
                        .getItem(0)
                        .setMatrix(matrix);
                }
            }
        },
        title: {
            text: options.title.text,
            style: {
                padding: '80px'
            }
        },
        subtitle: {
            text: options.yAxis.title.text,
            align: 'left',
            y: 20
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
            maxRange: 26,
            opposite: false,
            tickInterval: options.yAxis.tickInterval,
            endOnTick: false
        },
        rangeSelector: {
            enabled: false,
            inputEnabled: false,
            buttons: [
                {
                    text: '10',
                    count: 9,
                    type: 'millisecond'
                },
                {
                    text: '50',
                    count: 49,
                    type: 'millisecond'
                },
                {
                    text: '100',
                    count: 99,
                    type: 'millisecond'
                },
                {
                    text: '200',
                    count: 199,
                    type: 'millisecond'
                },
                {
                    text: 'all',
                    type: 'all'
                }
            ],
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
            margin: 3,
            height: 25
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
    chartSVG = document.querySelector('.highcharts-root');
    return chart;
};
//# sourceMappingURL=create-chart.js.map