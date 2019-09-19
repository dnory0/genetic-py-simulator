import { webFrame, ipcRenderer } from 'electron';
import { PythonShell } from 'python-shell';
import * as path from 'path';
import * as Highcharts from 'highcharts';
require('highcharts/modules/exporting')(Highcharts);

// document.addEventListener('DOMContentLoaded', function() {});
let playBtn = <HTMLButtonElement>document.getElementById('play-btn');
let stopBtn = <HTMLButtonElement>document.getElementById('stop-btn');
// restart the GA algorithm
let toStartBtn = <HTMLButtonElement>document.getElementById('to-start-btn');
// step back button (not implemented)
// let stepBBtn = <HTMLButtonElement>document.getElementById('step-back-btn');
// step forward button
let stepFBtn = <HTMLButtonElement>document.getElementById('step-forward-btn');
// used as args for pyShell
// let args = [
//   '64' /* Default genes number */,
//   '120' /* Default population size */
// ];
// by default user needs to hit the play button to run pyShell
let isPyShellRunning = false;

/************************ Python & Chart Configuration ************************
 ******************************************************************************/
// updated with fittest per generation
let progressChart: Highcharts.Chart;
// updated with fittest genes
let fittestChart: Highcharts.Chart;
// updated with fittest genes per generation
let currentChart: Highcharts.Chart;

const initChart = (containerId: string, options: Highcharts.Options) => {
  return Highcharts.chart(containerId, {
    title: {
      text: options.title.text,
      style: {
        padding: '80px'
      }
    },
    xAxis: {
      title: {
        text: (<Highcharts.XAxisOptions>options.xAxis).title.text,
        align: 'high'
      }
    },
    yAxis: {
      title: {
        text: (<Highcharts.YAxisOptions>options.yAxis).title.text,
        align: 'high',
        rotation: 0,
        y: -20,
        x: -5,
        offset: -35
      }
    },
    series: options.series,
    legend: {
      enabled: false
    },
    tooltip: {
      animation: false
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: false
    }
  });
};

progressChart = initChart('progress-chart', {
  chart: {
    type: 'line'
  },
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
      text: 'Fitness value'
    }
  },
  series: [
    {
      name: 'CGA',
      data: []
    }
  ] as Highcharts.SeriesLineOptions[],
  plotOptions: {
    series: {
      animation: false
    }
  }
});

fittestChart = initChart('fittest-chart', {
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
  ] as Highcharts.SeriesLineOptions[]
});
currentChart = initChart('current-chart', {
  chart: {
    type: 'line'
  },
  title: {
    text: 'Current Generation Fittest'
  },
  xAxis: {
    title: {
      text: 'Genes'
    }
  },
  series: [
    {
      data: []
    }
  ] as Highcharts.SeriesLineOptions[],
  yAxis: {
    title: {
      text: 'Gene value'
    }
  }
});

// an object that holds most fittest fitness with an array of their genes
let mostFittestInds = { 0: [] };
// an array of for every generation fittest genes
let fittestsHistory = [];

const clearChart = (chart: Highcharts.Chart, labels: boolean = true) => {
  if (labels) chart.xAxis[0].setCategories([]);
  chart.series[0].setData([]);
  chart.redraw();
};

/****************************** Python Part ******************************/

/**
 * declared and initialized globally
 */
let pyshell = new PythonShell('ga.py', {
  scriptPath: path.join(__dirname, 'python'),
  pythonOptions: ['-u'],
  // args: args,
  mode: 'json'
});
pyshell.on('message', (args: object) => {
  if (
    args['generation'] !== undefined &&
    args['fitness'] !== undefined &&
    args['genes'] !== undefined
  ) {
    progressChart.series[0].addPoint(
      parseInt(args['fitness']),
      true,
      false,
      false
    );
  } else if (args['started'] && args['genesNum'] !== undefined) {
    // clear past results
    clearChart(progressChart);
    clearChart(fittestChart);
    clearChart(currentChart);
    // to be able to change in ga state
    setBtnsClickable();
  }
});
pyshell.on('error', (err: Error) => console.error(`error trace: ${err}`));
/**
 * send play to GA, python side is responsible for whether
 * to start GA for first time are just resume
 */
const play = () => {
  pyshell.send('play');
};

/**
 * send pause to GA
 */
const pause = () => {
  pyshell.send('pause');
};

/**
 * send stop to GA
 */
const stop = () => {
  pyshell.send('stop');
};

/**
 * send step forward signal to GA, python side is responsible
 * to pause GA if needed
 */
const stepForward = () => {
  pyshell.send('step_f');
};

// let genesNum: number[];
// global to avoid sending it to the mainProcess, true by default
// to reset timer in case user reload window while GA running
let deleteTimeResult: boolean = true;

let close = true;
/************************ GUI & Buttons Configuration ************************
 *****************************************************************************/

/**
 * switch the play/pause button image depending on
 * isPyShellRunning state.
 */
const switchPlayBtn = () => {
  if (isPyShellRunning) {
    // show playing state
    (<HTMLImageElement>playBtn.querySelector('.play')).style.display = 'none';
    (<HTMLImageElement>playBtn.querySelector('.pause')).style.display = 'block';
  } else {
    // show start/paused state
    (<HTMLImageElement>playBtn.querySelector('.play')).style.display = 'block';
    (<HTMLImageElement>playBtn.querySelector('.pause')).style.display = 'none';
  }
};

/**
 * Set buttons (except play/pause button) clickable or not. Default is true.
 */
const setBtnsClickable = (clickable = true) => {
  Array.from(document.querySelector('.controls').children).forEach(
    (element, index) => {
      // to not effect play/pause button.
      if (index == 0) return;
      // disabled-btn class sets opacity to 0.6.
      if (clickable)
        (<HTMLButtonElement>element).classList.remove('disabled-btn');
      else (<HTMLButtonElement>element).classList.add('disabled-btn');
      (<HTMLButtonElement>element).disabled = !clickable;
    }
  );
};

/**
 * user sometimes try to pause the GA, but if the GA ended right before he
 * clicks the playBtn, pressing playBtn will restart the GA, to avoid that
 * the playBtn is disabled for .4s and than enabled
 */
// const blinkPlayBtn = () => {
//   playBtn.classList.add('disabled-btn');
//   playBtn.disabled = true;
//   setTimeout(() => {
//     playBtn.classList.remove('disabled-btn');
//     playBtn.disabled = false;
//   }, 400);
// };

/**
 * play and pause the pyshell when clicked with switching
 * the button image, if pyshell = undefined/null it initialize
 * a pyshell to start running and enable disabled buttons.
 */
playBtn.onclick = () => {
  // isPyShellRunning switched
  isPyShellRunning = !isPyShellRunning;
  if (isPyShellRunning) {
    play();
  } else {
    pause();
  }
  // notifyTimer('start');
  switchPlayBtn();
  // } else {
  // if (isPyShellRunning) {
  //   pyshell.send('');
  //   // notifyTimer('resume');
  //   switchPlayPauseBtn();
  // } else {
  //   // notifyTimer('pause');
  //   switchPlayPauseBtn();
  // }
  // }
  // activateTooltips(progressChart);
};

stopBtn.onclick = () => {
  setBtnsClickable(false);
  stop();
  // doesn't effect if pyshell is paused
  isPyShellRunning = false;
  // switch play/pause button to play state if needed
  switchPlayBtn();
};

toStartBtn.onclick = () => {
  stop();
  play();
  // in case pyshell was paused before
  isPyShellRunning = true;
  switchPlayBtn();
};

stepFBtn.onclick = () => {
  stepForward();
  // pyshell paused when going next step
  isPyShellRunning = false;
  // switch to paused state
  switchPlayBtn();
};

ipcRenderer.on('pyshell', () => {
  pyshell.terminate();
});
