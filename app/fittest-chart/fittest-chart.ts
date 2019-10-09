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
const createChart: (containerId: string, options: Options) => Chart = (<any>(
  window
)).createChart;

/**
 * updated every time a new most fittest appear, recives most fittest genes
 *
 * most fittest is a new fittest which its fitness value is better than every
 * fittest in the previous generations
 */
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
  ] as SeriesLineOptions[]
});
