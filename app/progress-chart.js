"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Highcharts = require("highcharts");
const electron_1 = require("electron");
let progressChart = Highcharts.chart('progress-chart', {
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
            data: [45, 15, 33]
        }
    ],
    plotOptions: {
        series: {
            animation: false
        }
    }
});
electron_1.ipcRenderer.on('data', (_event, message) => {
    console.log(message);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3Jlc3MtY2hhcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwcm9ncmVzcy1jaGFydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlDQUF5QztBQUN6Qyx1Q0FBNEM7QUFFNUMsSUFBSSxhQUFhLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRTtJQUNyRCxLQUFLLEVBQUU7UUFDTCxJQUFJLEVBQUUsTUFBTTtLQUNiO0lBQ0QsS0FBSyxFQUFFO1FBQ0wsSUFBSSxFQUFFLGdDQUFnQztLQUN2QztJQUNELEtBQUssRUFBRTtRQUNMLEtBQUssRUFBRTtZQUNMLElBQUksRUFBRSxZQUFZO1NBQ25CO0tBQ0Y7SUFDRCxLQUFLLEVBQUU7UUFDTCxLQUFLLEVBQUU7WUFDTCxJQUFJLEVBQUUsZUFBZTtTQUN0QjtLQUNGO0lBQ0QsTUFBTSxFQUFFO1FBQ047WUFDRSxJQUFJLEVBQUUsS0FBSztZQUNYLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO1NBQ25CO0tBQ2dDO0lBQ25DLFdBQVcsRUFBRTtRQUNYLE1BQU0sRUFBRTtZQUNOLFNBQVMsRUFBRSxLQUFLO1NBQ2pCO0tBQ0Y7Q0FDRixDQUFDLENBQUM7QUFFSCxzQkFBVyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEVBQUU7SUFDekMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN2QixDQUFDLENBQUMsQ0FBQyJ9