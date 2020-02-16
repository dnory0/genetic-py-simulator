import { Chart, SeriesLineOptions, Options } from 'highcharts';
import { IpcRendererEvent, IpcRenderer } from 'electron';

/**
 * by default the chart updates whenever it has a point added to it,
 * user can disable that from the interface switch so the chart updates
 * when the GA is paused or stopped. however if its disabled and user
 * pressed step forward button, the chart is not going to update that,
 * to fix that, step forward button is set to true after the step forward
 * is pressed, then chart adds the point, redraw, and set step forward
 * button back to false, replay used to remove the flash of showing the
 * chart and removing it in milliseconds, because replay is stopped event
 * (which triggers redraw the chart), and started event which clears past
 * values, the solution is to recieve replay event from host when replay
 * button is triggered to prevent chart redraw.
 */
let liveRendering = { isLive: true, stepForward: false, replay: false };

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
let treatResponse: (response: object) => void;

(() => {
  var min: number;
  var max: number;
  treatResponse = (response: object) => {
    if (response['generation'] !== undefined) {
      min = Math.min(min, response['fitness']);
      max = Math.max(max, response['fitness'] + 0.001);
      if (liveRendering.isLive || liveRendering.stepForward)
        primeChart.yAxis[0].setExtremes(min, max, false);

      // every point is added to primeChart
      primeChart.series[0].addPoint(
        parseInt(response['fitness']),
        liveRendering.isLive || liveRendering.stepForward,
        false,
        false
      );
      // to ignore the first generation (number 0) so it doesn't add -1 to xAxis
      if (response['generation'])
        primeChart.series[2].addPoint(
          [
            response['generation'] - 0.5,
            Math.min(response['prv-fitness'], response['fitness']),
            Math.max(response['prv-fitness'], response['fitness'])
          ],
          liveRendering.isLive || liveRendering.stepForward,
          false,
          false
        );
      if (liveRendering.stepForward) liveRendering.stepForward = false;
    } else if (response['started']) {
      min = Number.POSITIVE_INFINITY;
      max = Number.NEGATIVE_INFINITY;
      // clear past results
      clearChart(primeChart);
      // disable points on hover on chart if it's not just a step forward
      enableChartHover(response['first-step'], primeChart);
    } else if (
      response['paused'] ||
      response['stopped'] ||
      response['finished']
    ) {
      if (liveRendering.replay) liveRendering.replay = false;
      else {
        primeChart.yAxis[0].setExtremes(min, max);
        enableChartHover(true, primeChart);
      }
    } else if (response['resumed']) enableChartHover(false, primeChart);
  };
})();

/**
 * updated every generation, receives the generation with its fittest fitness
 */
let primeChart: Chart = window['createChart']('prime-chart', {
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
    },
    tickInterval: 1
  },
  tooltip: {
    formatter() {
      return `
          <div style="text-align: right">
            Generation: <b>${
              !`${this.x}`.match(/\.5$/)
                ? this.x
                : `${this.x - 0.5} - ${this.x + 0.5}`
            }</b><br>
            <span style="float: left;">
            ${!`${this.x}`.match(/\.5$/) ? 'Fitness' : 'Deviation'}:&nbsp;
            </span>
            <b>${
              !`${this.x}`.match(/\.5$/)
                ? this.y
                : Math.abs(this.point.high - this.point.low)
            }</b>
          </div>`;
    }
  },
  series: [
    {
      type: 'line',
      name: 'CGA',
      data: []
    },
    {
      type: 'line',
      name: 'QGA',
      data: []
    },
    {
      type: 'columnrange',
      name: 'Deviation',
      data: []
    }
  ] as SeriesLineOptions[]
} as Options);
delete window['createChart'];

/**
 * an array of for every generation fittest genes
 */
// window['fittestHistory'] = [];

ipcRenderer.on('data', (_event: IpcRendererEvent, data: object) =>
  treatResponse(data)
);

ipcRenderer.on(
  'live-rendering',
  (_ev, newLR: boolean) => (liveRendering.isLive = newLR)
);
ipcRenderer.on('step-forward', () => (liveRendering.stepForward = true));
ipcRenderer.on('replay', () => (liveRendering.replay = true));
