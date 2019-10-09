"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createChart = (window).createChart;
let progressChart = createChart('progress-chart', {
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