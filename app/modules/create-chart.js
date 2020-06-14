"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const highcharts_1 = require("highcharts");
module.exports = (containerId, options) => {
    delete require.cache[require.resolve('./create-chart')];
    return highcharts_1.chart(containerId, {
        chart: {
            resetZoomButton: {
                theme: {
                    style: {
                        pointerEvents: 'none',
                        opacity: 0,
                    },
                },
            },
            spacingBottom: 3,
            marginRight: 3,
            backgroundColor: 'white',
            events: options.chart.events,
            panning: {
                enabled: true,
            },
            panKey: 'ctrl',
        },
        tooltip: options.tooltip,
        title: {
            text: options.title.text,
        },
        xAxis: {
            crosshair: {
                width: 1,
            },
            title: {
                text: options.xAxis.title.text,
                align: 'high',
            },
            tickInterval: 1,
            min: options.xAxis.min,
            labels: options.xAxis.labels,
            minRange: options.xAxis.minRange,
        },
        colorAxis: {
            minColor: highcharts_1.getOptions().colors[8],
            maxColor: highcharts_1.getOptions().colors[2],
        },
        yAxis: {
            title: null,
            tickInterval: 1,
            labels: options.yAxis.labels,
            gridLineWidth: options.yAxis.gridLineWidth,
        },
        exporting: {
            enabled: false,
        },
        series: options.series,
        plotOptions: {
            series: {
                lineWidth: options.plotOptions.series.lineWidth,
                animation: false,
                states: {
                    hover: {
                        halo: {
                            opacity: 0,
                        },
                        lineWidth: 1,
                    },
                },
            },
        },
        subtitle: {
            text: options.yAxis.title.text,
            align: 'left',
        },
        legend: options.legend,
        credits: {
            enabled: false,
        },
    });
};
//# sourceMappingURL=create-chart.js.map