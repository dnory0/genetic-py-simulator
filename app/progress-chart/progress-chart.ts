import { Options, Chart, SeriesLineOptions } from 'highcharts';

/****************************** passed by preload ******************************
 *******************************************************************************/

/**
 * initialize a chart and pass it options
 * @param containerId id of html div tag that is going to contain chart
 * @param options chart options, see Highcharts.Options
 *
 * @returns set up chart
 */
const initChart: (containerId: string, options: Options) => Chart = (<any>(
  window
)).initChart;

/**
 * updated every generation, recieves the generation with its fittest fitness
 */
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
  ] as SeriesLineOptions[]
});
