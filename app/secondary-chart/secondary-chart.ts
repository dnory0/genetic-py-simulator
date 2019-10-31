import { Chart, SeriesLineOptions } from 'highcharts';
import { IpcRenderer, IpcRendererEvent } from 'electron';

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
  } else if (response['paused'] || response['finished'] || response['stopped'])
    enableChartHover(true, secondaryChart);
  else if (response['resumed']) enableChartHover(false, secondaryChart);
};

/**
 * updated every time a new most fittest appear, receives most fittest genes.
 *
 * most fittest is a new fittest which its fitness value is better than every
 * fittest in the previous generations
 */
let secondaryChart = window['createChart']('secondary-chart', {
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
delete window['createChart'];

ipcRenderer.on('data', (_event: IpcRendererEvent, response: Buffer) => {
  response
    .toString()
    .split('\n')
    .forEach((args: string) => {
      // console.log(args);
      // sometimes args == ''(not sure why), those cases need to be ignored
      if (args) treatResponse(JSON.parse(args));
    });
});
