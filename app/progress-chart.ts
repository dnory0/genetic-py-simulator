import * as Highcharts from 'highcharts';
import { ipcRenderer, app } from 'electron';

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
  ] as Highcharts.SeriesLineOptions[],
  plotOptions: {
    series: {
      animation: false
    }
  }
});

ipcRenderer.on('data', (_event, message) => {
  console.log(message);
});
