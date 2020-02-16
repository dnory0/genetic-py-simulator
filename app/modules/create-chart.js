"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const highcharts_1 = require("highcharts");
const Highcharts = require("highcharts");
const highcharts_more_1 = require("highcharts/highcharts-more");
highcharts_more_1.default(Highcharts);
module.exports = (containerId, options) => {
    delete require.cache[require.resolve('./create-pyshell')];
    return highcharts_1.chart(containerId, {
        chart: {},
        tooltip: {
            useHTML: true,
            formatter() {
                return `
          <div style="text-align: right">
            Generation: <b>${Number.isSafeInteger(this.x)
                    ? this.x
                    : `${this.x - 0.5} - ${this.x + 0.5}`}</b><br>
            <span style="float: left;">
              ${Number.isSafeInteger(this.x) ? 'Fitness' : 'Deviation'}:&nbsp;
            </span>
            <b>${Number.isSafeInteger(this.x)
                    ? this.y
                    : Math.abs(this.point.high - this.point.low)}</b>
          </div>`;
            }
        },
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
        legend: {
            enabled: false
        },
        credits: {
            enabled: false
        }
    });
};
//# sourceMappingURL=create-chart.js.map