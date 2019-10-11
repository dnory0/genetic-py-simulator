import { Options, Chart, SeriesLineOptions } from 'highcharts';
import { ChildProcess } from 'child_process';

/****************************** passed by preload ******************************
 *******************************************************************************/

/**
 * python process that executes GA
 */
let pyshell: ChildProcess = (<any>window).pyshell;

/**
 * an object that holds most fittest fitness with an array of their genes
 */
let mostFittest: {
  fitness: number;
  individuals?: [
    {
      generation: number;
      genes: any[];
    }
  ];
} = (<any>window).mostFittest;
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
 * enables or disable the hover settings for the passed chart
 * @param enable decides if to disable hover settings or enable them.
 * @param chart chart to apply hover settings on
 */
const enableChartHover: (enable: boolean, chart: Highcharts.Chart) => void = (<
  any
>window).enableChartHover;

/**
 * clears chart data and xAxis if needed and redraw instantly
 * @param chart chart to clear its data and xAxis
 * @param categories whether to clear categories, default is false
 */
const clearChart: (chart: Chart, categories?: boolean) => void = (<any>window)
  .clearChart;

/**
 * figure out what response stands for and act uppon it
 * @param response response of pyshell
 */
const treatResponse = (response: object) => {
  if (
    response['generation'] !== undefined &&
    response['fitness'] !== undefined &&
    response['genes'] !== undefined
  ) {
    // mostFittest processing work is done here instead of being in preload file
    // is to avoid race conditions because secondaryChart latest data is taken of it.
    // probably needs to moved on another file that imports reload file (when every
    // view and window has its own preload)
    if (mostFittest['fitness'] < response['fitness']) {
      mostFittest['fitness'] = response['fitness'];
      mostFittest['individuals'] = [
        {
          generation: response['generation'],
          genes: response['genes']
        }
      ];
    } else if (mostFittest['fitness'] == response['fitness']) {
      mostFittest['individuals'].unshift({
        generation: response['generation'],
        genes: response['genes']
      });
    }
    secondaryChart.series[0].setData(
      mostFittest.individuals[0].genes,
      true,
      false
    );
  } else if (response['started'] && response['genesNum'] !== undefined) {
    clearChart(secondaryChart);
    // clean mostFittest object before start recieving data
    mostFittest['fitness'] = -1;
    mostFittest['individuals'] = null;
    // setting up xAxis for fittest and current chart
    secondaryChart.xAxis[0].setCategories(
      [...Array(response['genesNum']).keys()].map(v => `${++v}`)
    );
    // disable points on hover on chart
    enableChartHover(false, secondaryChart);
  } else if (response['paused']) enableChartHover(true, secondaryChart);
  else if (response['resumed']) enableChartHover(false, secondaryChart);
};

/**
 * updated every time a new most fittest appear, recives most fittest genes
 *
 * most fittest is a new fittest which its fitness value is better than every
 * fittest in the previous generations
 */
let secondaryChart = createChart('secondary-chart', {
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
      data: []
    }
  ] as SeriesLineOptions[]
});

pyshell.stdout.on('data', (response: Buffer) => {
  response
    .toString()
    .split('\n')
    .forEach((args: string) => {
      // console.log(args);
      // sometimes args == ''(not sure why), those cases need to be ignored
      if (args) treatResponse(JSON.parse(args));
    });
});
