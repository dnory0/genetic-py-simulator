import { chart, Options, XAxisOptions, YAxisOptions } from 'highcharts';
const pyshell = require('electron').remote.require('./main').pyshell;

// console.log(require('electron').remote.require('./main').pyshell);
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

// /*************************** Python part ***************************/
(<any>window).pyshell = pyshell;

/************************* states controller part *************************/
/**
 * send play to GA, python side is responsible for whether to start GA for first time are just resume
 *
 * disables hover settings for charts
 */
(<any>window).play = () => {
  pyshell.stdin.write(`${JSON.stringify({ play: true })}\n`);
  // enableChartHover(false, /* progressChart, */ fittestChart, currentChart);
};

/**
 * send pause to GA, enables hover settings for charts
 */
(<any>window).pause = () => {
  pyshell.stdin.write(`${JSON.stringify({ pause: true })}\n`);
  // enableChartHover(true, /* progressChart, */ fittestChart, currentChart);
};

/**
 * send stop to GA, enables hover settings for charts
 */
(<any>window).stop = () => {
  pyshell.stdin.write(`${JSON.stringify({ stop: true })}\n`);
  // enableChartHover(true, /* progressChart, */ fittestChart, currentChart);
};

/**
 * stops current GA and launches new one, disables hover settings for charts in case enabled
 */
(<any>window).replay = () => {
  pyshell.stdin.write(`${JSON.stringify({ replay: true })}\n`);
  // enableChartHover(false, /* progressChart, */ fittestChart, currentChart);
};

/**
 * send step forward to GA, pyshell pauses GA if needed, enables tooltip for charts in case disabled
 */
(<any>window).stepForward = () => {
  pyshell.stdin.write(`${JSON.stringify({ step_f: true })}\n`);
  // enableChartHover(true, /* progressChart, */ fittestChart, currentChart);
};
