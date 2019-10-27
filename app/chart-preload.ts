import { ipcRenderer } from 'electron';
import { Chart } from 'highcharts';

/**
 * allows communication between this webview & renderer process
 */
window['ipcRenderer'] = ipcRenderer;

/**
 * initialize a chart and pass it options
 * @param containerId id of html div tag that is going to contain chart
 * @param options chart options
 *
 * @returns set up chart
 */
window['createChart'] = require('./create-chart');
/**
 * enables or disable the hover settings for the passed chart
 * @param enable decides if to disable hover settings or enable them.
 * @param chart chart to apply hover settings on
 */
window['enableChartHover'] = (enable: boolean, chart: Chart) => {
  chart.options.tooltip.enabled = enable;
  chart.update({
    plotOptions: {
      series: {
        marker: {
          enabled: enable,
          radius: enable ? 2 : null
        },
        states: {
          hover: {
            halo: {
              opacity: enable ? 0.5 : 0
            }
          }
        }
      }
    }
  });
};

/**
 * clears chart data and xAxis if needed and redraw instantly
 * @param chart chart to clear its data and xAxis
 * @param categories whether to clear categories, default is false
 */
window['clearChart'] = (chart: Chart, categories: boolean = false) => {
  if (categories) chart.xAxis[0].setCategories([]);
  chart.series[0].setData([], true);
};
