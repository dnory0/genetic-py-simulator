import { Chart, SeriesLineOptions, Options, Tooltip, TooltipPositionerPointObject, Point } from 'highcharts';
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
/**
 * whether GA is running
 */
let isRunning = false;

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
 * @param chart chart to apply hover settings on
 * @param enable decides if to disable hover settings or enable them.
 */
const toggleChartHover: (chart: Chart, enable: boolean) => void = window['toggleChartHover'];

/**
 * clears chart data and xAxis if needed and redraw instantly
 * @param chart chart to clear its data and xAxis
 * @param categories whether to clear categories, default is false
 */
const clearChart: (chart: Chart, categories?: boolean) => void = window['clearChart'];

/**
 * enables and disables the zoom functionality for the passed chart
 * @param chart chart to toggle its zoom functionality
 * @param enable if true, enables zooming, else disables it
 */
const toggleZoom: (chart: Chart, enable: boolean) => void = window['toggleZoom'];

/**
 * figure out what response stands for and act uppon it
 * @param response response of pyshell
 */
let treatResponse: (response: object) => void;

/**
 *
 */
var min = Infinity,
  max = -Infinity;
let updateExtremes = (newValue?: number) => {
  if (newValue == undefined) (min = Infinity), (max = -Infinity);
  else (min = Math.min(min, newValue)), (max = Math.max(max, newValue));
};

treatResponse = (response: object) => {
  if (response['generation'] !== undefined) {
    updateExtremes(response['fitness']);
    if ((liveRendering.isLive || liveRendering.stepForward) && !window['zoomed']) {
      primeChart.yAxis[0].setExtremes(min, max, false);
    }

    // every point is added to primeChart
    primeChart.series[0].addPoint(parseInt(response['fitness']), liveRendering.isLive || liveRendering.stepForward, false, false);
    // to ignore the first generation (number 0) so it doesn't add -1 to xAxis
    if (response['generation'])
      primeChart.series[1].addPoint(
        [
          response['generation'] - 0.5,
          Math.min(response['prv-fitness'], response['fitness']),
          Math.max(response['prv-fitness'], response['fitness']),
        ],
        liveRendering.isLive || liveRendering.stepForward,
        false,
        false
      );
    if (liveRendering.stepForward) liveRendering.stepForward = false;
  } else if (response['started']) {
    isRunning = true;
    updateExtremes();
    // clear past results
    clearChart(primeChart);
    // disable points on hover on chart if it's not just a step forward
    primeChart.xAxis[0].setExtremes(0, null, true, false);
    window['zoomed'] = false;
    toggleChartHover(primeChart, response['first-step']);
    toggleZoom(primeChart, response['first-step']);
  } else if (response['paused'] || response['stopped'] || response['finished']) {
    isRunning = false;
    if (liveRendering.replay) liveRendering.replay = false;
    else {
      if (!window['zoomed']) {
        primeChart.yAxis[0].setExtremes(min, max);
      }
      toggleChartHover(primeChart, true);
      toggleZoom(primeChart, true);
    }
  } else if (response['resumed']) {
    isRunning = true;
    primeChart.xAxis[0].setExtremes(0, null, true, false);
    window['zoomed'] = false;
    toggleChartHover(primeChart, false);
    toggleZoom(primeChart, false);
  }
};

/**
 * updated every generation, receives the generation with its fittest fitness
 */
let primeChart: Chart = window['createChart']('prime-chart', {
  chart: {
    events: {
      selection() {
        if (isRunning) return;
        window['zoomed'] = true;
        this.yAxis[0].setExtremes(null, null, false);
        return null;
      },
    },
  },
  title: {
    text: 'Fittest per Generation',
  },
  xAxis: {
    title: {
      text: 'Generation',
    },
    min: 0,
    labels: {
      enabled: true,
    },
    minRange: 4,
  },
  yAxis: {
    title: {
      text: 'Fitness/Deviation',
    },
    tickInterval: 1,
    labels: {
      enabled: true,
    },
    gridLineWidth: 1,
  },
  tooltip: {
    useHTML: true,
    formatter() {
      return `
            <span>Generation: <b>${!`${this.x}`.match(/\.5$/) ? this.x : `${this.x - 0.5} - ${this.x + 0.5}`}</b>
            </span>
            <span>,&nbsp;
            ${!`${this.x}`.match(/\.5$/) ? 'Fitness' : 'Deviation'}:&nbsp;
            <b>${!`${this.x}`.match(/\.5$/) ? this.y : Math.abs(this.point.high - this.point.low)}</b>
            </span>
          `;
    },
    // to avoid the action buttons overlapping the tooltip
    positioner(labelWidth, labelHeight, point: Point | TooltipPositionerPointObject) {
      point = <TooltipPositionerPointObject>point;
      var x =
        point.plotX +
        primeChart.chartWidth -
        primeChart.plotWidth -
        (point.plotX + labelWidth + 80 < (<Tooltip>this).chart.plotWidth ? 4 : labelWidth + 4);
      var y = point.plotY + (point.plotY > 30 ? 8 : labelHeight + 50);
      return { x, y };
    },
    shadow: false,
    outside: false,
    hideDelay: 250,
    borderRadius: 0,
  },
  legend: {
    floating: true,
    itemMarginBottom: -5,
    itemDistance: 10,
    symbolPadding: 2,
  },
  series: [
    {
      type: 'line',
      name: 'CGA',
      data: [],
    },
    {
      type: 'columnrange',
      name: 'Deviation',
      data: [],
    },
  ] as SeriesLineOptions[],
  plotOptions: {
    series: {
      lineWidth: 1,
    },
  },
} as Options);
delete window['createChart'];

window['ready'](treatResponse);

ipcRenderer.on('live-rendering', (_ev, newLR: boolean) => (liveRendering.isLive = newLR));
ipcRenderer.on('step-forward', () => (liveRendering.stepForward = true));
ipcRenderer.on('replay', () => (liveRendering.replay = true));

ipcRenderer.on('export', (_ev, actionType: string) => {
  switch (actionType) {
    case 'jpeg':
      primeChart.exportChartLocal({
        type: 'image/jpeg',
      });
      break;
    case 'svg':
      primeChart.exportChartLocal({
        type: 'image/svg+xml',
      });
      break;
  }
});

ipcRenderer.on('zoom-out', () => {
  primeChart.xAxis[0].setExtremes(0, null, false);
  primeChart.yAxis[0].setExtremes(min, max, false);
  primeChart.redraw(true);
  window['zoomed'] = false;
});
