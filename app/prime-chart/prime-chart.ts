import {
  Chart,
  SeriesLineOptions,
  Options,
  TooltipPositionerPointObject,
  Tooltip
} from 'highcharts';
import { IpcRenderer } from 'electron';

/**
 * by default the chart updates whenever it has a point added to it, user can disable that
 * from the interface switch so the chart updates when the GA is paused or stopped. However,
 * if live rendering is disabled and user presses step forward button, the chart is not going to
 * redraw the new added point, to fix that, stepForward flag is set to true after the step forward
 * button is pressed, then chart adds the point, redraw, and set step forward button back to false,
 * replay used to remove the flash of showing the chart and removing it in milliseconds, because
 * replay is (stopped event (which redraws the chart) + started event which clears past values),
 * the solution is to recieve replay event from host when replay button is triggered to prevent
 * chart redraw.
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
        primeChart.series[1].addPoint(
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
    text: 'Fittest per Generation'
  },
  xAxis: {
    title: {
      text: 'Generation'
    },
    min: 0,
    labels: {
      enabled: true
    }
  },
  yAxis: {
    title: {
      text: 'Fitness/Deviation'
    },
    tickInterval: 1,
    labels: {
      enabled: true
    },
    gridLineWidth: 1
  },
  tooltip: {
    useHTML: true,
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
    },
    // to avoid the action buttons overlapping the tooltip
    positioner(
      labelWidth: number,
      labelHeight: number,
      point: TooltipPositionerPointObject
    ) {
      // var x =
      //   point.plotX + labelWidth + 80 < (<Tooltip>this).chart.plotWidth
      //     ? point.plotX + 28
      //     : point.plotX - (labelWidth - 48);
      // var y = point.plotY + (point.plotY > 30 ? 4 : labelHeight + 25);
      var x =
        point.plotX + labelWidth + 80 < (<Tooltip>this).chart.plotWidth
          ? point.plotX + 38
          : point.plotX - (labelWidth - 38);
      var y = point.plotY + (point.plotY > 30 ? 4 : labelHeight + 25);
      return { x, y };
    },
    shadow: false,
    outside: false,
    hideDelay: 250
  },
  legend: {
    floating: true,
    itemMarginBottom: -5,
    itemDistance: 10,
    symbolPadding: 2
  },
  series: [
    {
      type: 'line',
      name: 'CGA',
      data: []
    },
    {
      type: 'columnrange',
      name: 'Deviation',
      data: []
    },
    {
      type: 'line',
      name: 'QGA',
      data: []
    }
  ] as SeriesLineOptions[]
} as Options);
delete window['createChart'];

/**
 * an array of for every generation fittest genes
 */
// window['fittestHistory'] = [];

window['ready'](treatResponse);

ipcRenderer.on(
  'live-rendering',
  (_ev, newLR: boolean) => (liveRendering.isLive = newLR)
);
ipcRenderer.on('step-forward', () => (liveRendering.stepForward = true));
ipcRenderer.on('replay', () => (liveRendering.replay = true));

ipcRenderer.on('export', (_ev, actionType: string) => {
  switch (actionType) {
    case 'png':
      primeChart.exportChartLocal({
        type: 'image/png'
      });
      break;
    case 'jpeg':
      primeChart.exportChartLocal({
        type: 'image/jpeg'
      });
      break;
    case 'svg':
      primeChart.exportChartLocal({
        type: 'image/svg+xml'
      });
      break;
  }
});
