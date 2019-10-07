"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const initChart = (window).initChart;
let progressChart = initChart('progress-chart', {
    chart: {
        type: 'line'
    },
    title: {
        text: 'Fittest Fitness per Generation'
    },
    xAxis: {
        title: {
            text: 'Generation'
        }
    },
    yAxis: {
        title: {
            text: 'Fitness value'
        }
    },
    series: [
        {
            name: 'CGA',
            data: [44, 55]
        }
    ]
});
//# sourceMappingURL=progress-chart.js.map