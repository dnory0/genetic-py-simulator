import { ipcRenderer, remote } from 'electron';
import * as Highcharts from 'highcharts';
import { Chart } from 'highcharts';
import { join } from 'path';
import { ChildProcess } from 'child_process';

import exporting from 'highcharts/modules/exporting';
import offlineExporting from 'highcharts/modules/offline-exporting';
import exportData from 'highcharts/modules/export-data';

exporting(Highcharts);
offlineExporting(Highcharts);
exportData(Highcharts);

const { getGlobal } = remote;
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
window['createChart'] = require(join(__dirname, '..', 'modules', 'create-chart'));
/**
 * enables or disable the hover settings for the passed chart
 * @param chart chart to apply hover settings on
 * @param enable decides if to disable hover settings or enable them.
 */
window['toggleChartHover'] = (chart: Chart, enable: boolean) => {
  chart.update(
    {
      tooltip: {
        enabled: enable,
      },
      xAxis: {
        crosshair: enable,
      },
      legend: {
        itemStyle: {
          pointerEvents: enable ? 'all' : 'none',
        },
        itemCheckboxStyle: {
          pointerEvents: enable ? 'all' : 'none',
        },
      },
      plotOptions: {
        series: {
          marker: {
            enabled: enable,
            radius: enable ? 1.5 : null,
          },
          states: {
            hover: {
              halo: {
                opacity: enable ? 0.5 : 0,
              },
            },
          },
        },
      },
    },
    true,
    false,
    false
  );
};

/**
 * clears chart data and xAxis if needed and redraw instantly
 * @param chart chart to clear its data and xAxis
 * @param categories whether to clear categories, default is false
 */
window['clearChart'] = (chart: Chart, categories: boolean = false) => {
  if (categories) chart.xAxis[0].setCategories([]);
  // to adapt more than one serie chart
  chart.series.forEach(serie => serie.setData([], true));
};

if (getGlobal('isDev'))
  window.addEventListener(
    'keyup',
    (event: KeyboardEvent) => {
      if (event.code == 'Backquote')
        if (event.ctrlKey)
          if (event.shiftKey) ipcRenderer.sendToHost('devTools', 'side');
          else ipcRenderer.sendToHost('devTools', 'prime');
    },
    true
  );

window['ready'] = (treatResponse: (response: object) => void) => {
  delete window['ready'];
  (<ChildProcess>getGlobal('pyshell')).stdout.on('data', (response: Buffer) => {
    response
      .toString()
      .split(/(?<=\n)/g)
      .map((data: string) => JSON.parse(data))
      .forEach((data: object) => treatResponse(data));
  });
};

/**
 * enables and disables the zoom functionality for the passed chart
 * @param chart chart to toggle its zoom functionality
 * @param enable if true, enables zooming, else disables it
 */
window['toggleZoom'] = (chart: Chart, enable: boolean) => {
  if (window['zoomed']) return;
  chart.update(
    {
      chart: {
        zoomType: enable ? 'x' : null,
        panning: {
          enabled: enable,
        },
      },
    },
    true,
    false,
    false
  );
};
