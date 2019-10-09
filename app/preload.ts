import { chart, Options, XAxisOptions, YAxisOptions } from 'highcharts';
const pyshell = require('electron').remote.require('./main').pyshell;

/************************ Charts & Python Configuration ************************
 ******************************************************************************/
/**
 * initialize a chart and pass it options
 * @param containerId id of html div tag that is going to contain chart
 * @param options chart options
 *
 * @returns set up chart
 */
(<any>window).createChart = (containerId: string, options: Options) => {
  return chart(containerId, {
    title: {
      text: options.title.text,
      style: {
        padding: '80px'
      }
    },
    xAxis: {
      title: {
        text: (<XAxisOptions>options.xAxis).title.text,
        align: 'high'
      }
    },
    yAxis: {
      title: {
        text: (<YAxisOptions>options.yAxis).title.text,
        align: 'high',
        rotation: 0,
        y: -20,
        x: -5,
        offset: -35
      }
    },
    series: options.series,
    plotOptions: {
      series: {
        animation: false,
        states: {
          hover: {
            halo: {
              opacity: 0
            }
          }
        }
      }
    },
    legend: {
      enabled: false
    },
    credits: {
      enabled: false
    }
  });
};

/**
 * enables or disable the hover settings for the passed chart
 * @param enable decides if to disable hover settings or enable them.
 * @param chart chart to apply hover settings on
 */
(<any>window).enableChartHover = (enable: boolean, chart: Highcharts.Chart) => {
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
(<any>window).clearChart = (
  chart: Highcharts.Chart,
  categories: boolean = false
) => {
  if (categories) chart.xAxis[0].setCategories([]);
  chart.series[0].setData([]);
  chart.redraw();
};

/**
 * set up X axis with genes numeration 1 2 .. <genes number>
 * @param args contains genes number that's needed to set up X axis of the chart
 * @param charts chart to set its X axis
 */
(<any>window).settingXAxis = (args: object, chart: Highcharts.Chart) => {
  const genes = [...Array(args['genesNum']).keys()].map(v => `${++v}`);
  chart.xAxis[0].setCategories(genes);
};

/*************************** Python part ***************************/
(<any>window).pyshell = pyshell;

/**
 * an object that holds most fittest fitness with an array of their genes
 */
(<any>window).mostFittest = { fitness: -1 };
/**
 * an array of for every generation fittest genes
 */
(<any>window).fittestHistory = [];

/************************* states controller part *************************/
/**
 * send play to GA, python side is responsible for whether to start GA for first time are just resume
 */
(<any>window).play = () => {
  pyshell.stdin.write(`${JSON.stringify({ play: true })}\n`);
};

/**
 * send pause to GA
 */
(<any>window).pause = () => {
  pyshell.stdin.write(`${JSON.stringify({ pause: true })}\n`);
};

/**
 * send stop to GA
 */
(<any>window).stop = () => {
  pyshell.stdin.write(`${JSON.stringify({ stop: true })}\n`);
};

/**
 * stops current GA and launches new one
 */
(<any>window).replay = () => {
  pyshell.stdin.write(`${JSON.stringify({ replay: true })}\n`);
};

/**
 * send step forward to GA, pyshell pauses GA if needed
 */
(<any>window).stepForward = () => {
  pyshell.stdin.write(`${JSON.stringify({ step_f: true })}\n`);
};
