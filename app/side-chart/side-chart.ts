import { Chart, Options } from 'highcharts';
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
} = { fitness: -1, individuals: null };

/**
 * enables or disable the hover settings for the passed chart
 * @param enable decides if to disable hover settings or enable them.
 * @param chart chart to apply hover settings on
 */
const enableChartHover: (enable: boolean, chart: Highcharts.Chart) => void =
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
          genes: response['genes']
        }
      ];

      sideChart.series[1].setData(
        sideChart.series[0].data.map(aData => [aData.x, 1.5, aData.value]),
        true,
        false
      );

      sideChart.series[0].setData(
        (<any[]>response['genes']).map((gene, i) => [i, 0.1, gene]),
        true,
        false
      );
    } else if (mostFittest['fitness'] == response['fitness']) {
      mostFittest['individuals'].push({
        generation: response['generation'],
        genes: response['genes']
      });
    }
  } else if (response['started']) {
    clearChart(sideChart);
    // clean mostFittest object before start recieving data
    mostFittest['fitness'] = -1;
    mostFittest['individuals'] = null;
    // disable points on hover on chart if it's not just a step forward
    enableChartHover(response['first-step'], sideChart);
  } else if (response['paused'] || response['stopped'] || response['finished'])
    enableChartHover(true, sideChart);
  else if (response['resumed']) enableChartHover(false, sideChart);
};

/**
 * updated every time it receives a new fittest genes.
 *
 * fittest is a placed below, and previous fittest is placed above
 */
let sideChart: Chart = window['createChart']('side-chart', {
  title: {
    text: 'Genes'
  },
  xAxis: {
    title: {
      text: 'Gene'
    },
    labels: {
      formatter() {
        return (this.value + 1).toString();
      }
    }
  },
  yAxis: {
    title: {
      text: 'Value'
    },
    tickInterval: 1,
    labels: {
      enabled: false
    },
    gridLineWidth: 0
  },
  tooltip: {
    formatter() {
      return `
      <div style="width: 80px">
        <div><b>${
          parseInt(this.series.getName().match(/(?<=Series )[0-9]+/)[0]) == 1
            ? 'Fittest'
            : 'Prev Fittest'
        }:</b></div>
        <div>Gene:&nbsp<b style="float: right">${this.point.x + 1}</b></div>
        <div>Value:&nbsp<b style="float: right">${this.point.value}</b></div>
      </div>`;
    }
  },
  legend: {
    enabled: false
  },
  series: [
    {
      type: 'heatmap',
      data: []
    },
    {
      type: 'heatmap',
      data: []
    }
  ]
} as Options);

delete window['createChart'];

window['ready'](treatResponse);

ipcRenderer.on('export', (_ev, actionType: string) => {
  switch (actionType) {
    case 'png':
      sideChart.exportChartLocal({
        type: 'image/png'
      });
      break;
    case 'jpeg':
      sideChart.exportChartLocal({
        type: 'image/jpeg'
      });
      break;
    case 'svg':
      sideChart.exportChartLocal({
        type: 'image/svg+xml'
      });
      break;
  }
});
