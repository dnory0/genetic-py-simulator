import { Options, Chart, SeriesLineOptions } from 'highcharts';
import { ChildProcess } from 'child_process';
import { IpcRenderer, WebFrame, IpcRendererEvent } from 'electron';

/****************************** passed by preload ******************************
 *******************************************************************************/

const ipcRenderer: IpcRenderer = (<any>window).ipcRenderer;

/**
 * needed to extract the value of the current frame zoom level, default is 0,
 * and each zoom in/out is addition/minus of 0.5 respectively.
 */
const webFrame: WebFrame = (<any>window).webFrame;

/**
 * python process that executes GA
 */
let pyshell: ChildProcess = (<any>window).pyshell;

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
    // every point is added to primaryChart
    primaryChart.series[0].addPoint(
      parseInt(response['fitness']),
      true,
      false,
      false
    );
  } else if (response['started'] && response['genesNum'] !== undefined) {
    // clear past results
    clearChart(primaryChart);
    // disable points on hover on chart
    enableChartHover(false, primaryChart);
  } else if (response['paused'] || response['finished'])
    enableChartHover(true, primaryChart);
  else if (response['resumed']) enableChartHover(false, primaryChart);
};

/**
 * updated every generation, recieves the generation with its fittest fitness
 */
let primaryChart = createChart('primary-chart', {
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
      data: []
    }
  ] as SeriesLineOptions[]
});

pyshell.stdout.on('data', (response: Buffer) => {
  // treatResponse(JSON.parse(response.toString()));
  response
    .toString()
    .split('\n')
    .forEach((args: string) => {
      // console.log(args);
      // sometimes args == ''(not sure why), those cases need to be ignored
      if (args) treatResponse(JSON.parse(args));
    });
});

ipcRenderer.on('zoom', (_event: IpcRendererEvent, args: { zoom: number }) => {
  webFrame.setZoomLevel(args.zoom);
});
