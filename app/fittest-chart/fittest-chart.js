"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createChart = (window).createChart;
let fittestChart = createChart('fittest-chart', {
    chart: {
        type: 'line'
    },
    title: {
        text: 'Best Fittest'
    },
    xAxis: {
        title: {
            text: 'Genes'
        }
    },
    yAxis: {
        title: {
            text: 'Gene value'
        }
    },
    series: [
        {
            data: [44, 22]
        }
    ]
});
//# sourceMappingURL=fittest-chart.js.map