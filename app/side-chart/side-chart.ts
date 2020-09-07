import { Chart, Options, TooltipPositionerPointObject, Point, chart } from 'highcharts';
import { IpcRenderer } from 'electron';

/****************************** passed by preload ******************************
 *******************************************************************************/

/**
 * allows communication between this webview & renderer process
 */
const ipcRenderer: IpcRenderer = window['ipcRenderer'];
delete window['ipcRenderer'];

/**
 * an object that holds most fittest fitness with an array of their genes
 */
let mostFittest: {
  fitness: number;
  individuals: [
    {
      generation: number;
      genes: any[];
    }
  ];
} = { fitness: Number.MIN_SAFE_INTEGER, individuals: null };

/**
 * enables or disable the hover settings for the passed chart
 * @param chart chart to apply hover settings on
 * @param enable decides if to disable hover settings or enable them.
 */
const toggleChartHover: (chart: Chart, enable: boolean) => void = window['toggleChartHover'];

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
const treatResponse = (response: object) => {
  if (response['generation'] !== undefined) {
    // mostFittest processing work is done here instead of being in preload file
    // is to avoid race conditions because sideChart latest data is taken of it.
    // probably needs to moved on another file that imports reload file (when every
    // view and window has its own preload)
    if (mostFittest['fitness'] < response['fitness']) {
      mostFittest['fitness'] = response['fitness'];
      mostFittest['individuals'] = [
        {
          generation: response['generation'],
          genes: response['genes'],
        },
      ];
    } else if (mostFittest['fitness'] == response['fitness']) {
      mostFittest['individuals'].push({
        generation: response['generation'],
        genes: response['genes'],
      });
    }
    if (response['fitness'] < mostFittest['fitness']) return;
    sideChart.series[0].setData(
      (<any[]>response['genes']).map((gene, i) => [i, 2.5, gene]),
      true,
      false,
      false
    );
  } else if (response['started']) {
    sideChart.xAxis[0].setExtremes(null, null, true, true);
    // clean mostFittest object before start recieving data
    mostFittest['fitness'] = Number.MIN_SAFE_INTEGER;
    mostFittest['individuals'] = null;
    // disable points on hover on chart if it's not just a step forward
    toggleChartHover(sideChart, response['first-step']);
    toggleZoom(sideChart, response['first-step']);
  } else if (response['paused'] || response['stopped'] || response['finished']) {
    toggleChartHover(sideChart, true);
    toggleZoom(sideChart, true);
  } else if (response['resumed']) {
    sideChart.xAxis[0].setExtremes(0, null, true, false);
    toggleChartHover(sideChart, false);
    toggleZoom(sideChart, false);
  }
};

/**
 * updated every time it receives a new fittest genes.
 *
 * fittest is a placed below, and previous fittest is placed above
 */
let sideChart: Chart = window['createChart']('side-chart', {
  chart: {
    events: {},
  },
  title: {
    text: 'Genes',
  },
  xAxis: {
    title: {
      text: 'Gene',
    },
    min: 0,
    labels: {
      formatter() {
        return (this.value + 1).toString();
      },
    },
    minRange: 4,
  },
  yAxis: {
    title: {
      text: 'Value',
    },
    tickInterval: 1,
    labels: {
      enabled: false,
    },
    gridLineWidth: 0,
  },
  tooltip: {
    useHTML: true,
    formatter() {
      return `
        <span><b>${this.series.getName() == 'F' ? 'Fittest' : 'Prev Fittest'}:</b></span>
        <span>Gene:&nbsp<b>${this.point.x + 1}</b></span>
        <span>,&nbsp;Value:&nbsp<b>${this.point.value}</b></span>
      `;
    },
    positioner(labelWidth, labelHeight, point: Point | TooltipPositionerPointObject) {
      point = <TooltipPositionerPointObject>point;
      var x = point.plotX + labelWidth + 80 < sideChart.plotWidth ? point.plotX + 9 : point.plotX - (labelWidth - 9);
      var y = point.plotY + (point.plotY > 30 ? 8 : labelHeight + 50);
      return { x, y };
    },
    shadow: false,
    outside: false,
    hideDelay: 250,
    borderRadius: 0,
  },
  legend: {
    enabled: false,
  },
  series: [
    {
      name: 'F',
      type: 'heatmap',
      data: [],
    },
  ],
  plotOptions: {
    series: {
      lineWidth: 0,
    },
  },
} as Options);

delete window['createChart'];

window['ready'](treatResponse);

ipcRenderer.on('export', (_ev, actionType: string) => {
  switch (actionType) {
    case 'jpeg':
      sideChart.exportChartLocal({
        type: 'image/jpeg',
      });
      break;
    case 'svg':
      sideChart.exportChartLocal({
        type: 'image/svg+xml',
      });
      break;
  }
});

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

ipcRenderer.on('download', (_ev, actionType: string) => {
  console.log(JSON.stringify(sideChart.yAxis[0].series[0].data.map(p => p.value)));

  download(
    actionType + '.json',
    actionType == 'list'
      ? JSON.stringify(sideChart.yAxis[0].series[0].data.map(p => p.value))
      : JSON.stringify({ ...sideChart.yAxis[0].series[0].data.map(p => p.value) })
  );
  console.log(sideChart.yAxis[0].series[0].data.map(p => p.value));
});

ipcRenderer.on('zoom-out', () => {
  sideChart.xAxis[0].setExtremes(null, null, true, true);
});
