"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const highcharts_1 = require("highcharts");
const pyshell = require('electron').remote.require('./main');
window.createChart = (containerId, options) => {
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
window.enableChartHover = (enable, chart) => {
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
window.clearChart = (chart, categories = false) => {
    if (categories)
        chart.xAxis[0].setCategories([]);
    chart.series[0].setData([]);
    chart.redraw();
};
window.pyshell = pyshell;
window.mostFittest = { fitness: -1 };
window.fittestHistory = [];
window.play = () => {
    pyshell.stdin.write(`${JSON.stringify({ play: true })}\n`);
};
window.pause = () => {
    pyshell.stdin.write(`${JSON.stringify({ pause: true })}\n`);
};
window.stop = () => {
    pyshell.stdin.write(`${JSON.stringify({ stop: true })}\n`);
};
window.replay = () => {
    pyshell.stdin.write(`${JSON.stringify({ replay: true })}\n`);
};
window.stepForward = () => {
    pyshell.stdin.write(`${JSON.stringify({ step_f: true })}\n`);
};
//# sourceMappingURL=preload.js.map