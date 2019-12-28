import { Chart, SeriesLineOptions } from 'highcharts';
import { IpcRendererEvent, IpcRenderer } from 'electron';

/****************************** passed by preload ******************************
 *******************************************************************************/

/**
 * allows sending resizing information to main process to resize prime &
 * side view
 */
const ipcRenderer: IpcRenderer = window['ipcRenderer'];
delete window['ipcRenderer'];

/**
 * enables or disable the hover settings for the passed chart
 * @param enable decides if to disable hover settings or enable them.
 * @param chart chart to apply hover settings on
 */
const enableChartHover: (enable: boolean, chart: Chart) => void =
  window['enableChartHover'];

/**
 * clears chart data and xAxis if needed and redraw instantly
 * @param chart chart to clear its data and xAxis
 * @param categories whether to clear categories, default is false
 */
const clearChart: (chart: Chart, categories?: boolean) => void =
  window['clearChart'];

/**
 * figure out what response stands for and act uppon it
 * @param response response of pyshell
 */
const treatResponse = (response: object) => {
  if (response['fitness'] !== undefined) {
    // every point is added to primeChart
    primeChart.series[0].addPoint(
      parseInt(response['fitness']),
      true,
      false,
      false
    );
  } else if (response['started']) {
    // clear past results
    clearChart(primeChart);
    // disable points on hover on chart
    enableChartHover(false, primeChart);
  } else if (response['paused'] || response['finished'] || response['stopped'])
    enableChartHover(true, primeChart);
  else if (response['resumed']) enableChartHover(false, primeChart);
};

/**
 * updated every generation, receives the generation with its fittest fitness
 */
let primeChart = window['createChart']('prime-chart', {
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
      text: 'Fitness'
    }
  },
  series: [
    {
      name: 'CGA',
      data: []
    }
  ] as SeriesLineOptions[]
});
delete window['createChart'];

/**
 * an array of for every generation fittest genes
 */
// window['fittestHistory'] = [];

ipcRenderer.on('data', (_event: IpcRendererEvent, data: Buffer) => {
  data
    .toString()
    .split(/(?<=\n)/)
    .forEach((args: string) => treatResponse(JSON.parse(args)));
});
