import { webFrame, ipcRenderer } from 'electron';
import { PythonShell } from 'python-shell';
import * as path from 'path';
import * as Chart from 'chart.js';

let playBtn = <HTMLButtonElement>document.getElementById('play-btn');
let stopBtn = <HTMLButtonElement>document.getElementById('stop-btn');
// restart the GA algorithm
let toStartBtn = <HTMLButtonElement>document.getElementById('to-start-btn');
// step back button
let stepBBtn = <HTMLButtonElement>document.getElementById('step-back-btn');
// step forward button
let stepFBtn = <HTMLButtonElement>document.getElementById('step-forward-btn');
// used as args for pyShell
let args = [
  '64' /* Default genes number */,
  '120' /* Default population size */
];
// by default user needs to hit the play button to run pyShell
let isPyShellRunning = false;

/************************ Python & Chart Configuration ************************
 ******************************************************************************/
// updated with fittest per generation
let progressChart: Chart;
// updated with fittest genes
let fittestChart: Chart;
// updated with fittest genes per generation
let currentChart: Chart;

const initChart = (
  canvas: HTMLCanvasElement,
  {
    options: {
      title: { text },
      animation: { duration },
      devicePixelRatio
    }
  }: Chart.ChartConfiguration
) => {
  return new Chart(canvas, {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'Progress',
          fill: 'rgba(0,0,0,0)',
          backgroundColor: '#3572A5',
          borderColor: '#3572A5',
          borderWidth: 2,
          // pointRadius: 0,
          lineTension: 0
        }
      ]
    },
    options: {
      title: {
        display: true,
        position: 'top',
        text
      },
      animation: {
        duration: duration ? duration : 0
      },
      devicePixelRatio: devicePixelRatio ? devicePixelRatio : 2,
      elements: {
        point: {
          borderWidth: 3
        }
      },
      tooltips: {
        enabled: false
      }
    }
  });
};

let progressCtx = <HTMLCanvasElement>document.getElementById('progress-chart');
progressChart = initChart(progressCtx, {
  options: {
    title: {
      text: 'Fittest Fitness per Generation'
    },
    maintainAspectRatio: false,
    responsive: true,
    animation: {
      duration: 100
    }
  }
});
let fittestCtx = <HTMLCanvasElement>document.getElementById('fittest-chart');
fittestChart = initChart(fittestCtx, {
  options: {
    title: {
      text: 'Best Fittest Genes'
    },
    animation: {
      duration: 200
    }
  }
});
let currentCtx = <HTMLCanvasElement>document.getElementById('current-chart');
currentChart = initChart(currentCtx, {
  options: {
    title: {
      text: 'Current Generation Fittest Genes'
    },
    animation: {
      duration: 0
    }
  }
});

const activateTooltips = (chart: Chart) => {
  // chart.options.tooltips.enabled = !isPyShellRunning;
};

const clearChart = (chart: Chart) => {
  chart.data.labels = [];
  chart.data.datasets[0].data = [];
  chart.update();
};

/****************************** Python Part ******************************/

// declared and initialized globally
let pyshell = new PythonShell('ga.py', {
  scriptPath: path.join(__dirname, 'python'),
  pythonOptions: ['-u'],
  // args: args,
  mode: 'json'
});
pyshell.on('message', (args: object) => {
  // console.log(args['generation']);
  if (args['generation'] && args['fitness']) {
    progressChart.data.labels.push(`${args['generation']}`);
    progressChart.data.datasets[0].data.push(parseInt(args['fitness']));
    progressChart.update();
  } else if (args['started']) {
    // clear past results
    clearChart(progressChart);
    clearChart(fittestChart);
    clearChart(currentChart);
  }
});

pyshell.on('error', (err: Error) => console.error(`error trace: ${err}`));
pyshell.on('close', () => console.log('closed'));
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
/***************************** GUI Configuration *****************************
 *****************************************************************************/
// webFrame.setZoomLevel(0);
// webFrame.setZoomFactor(1);

/**
 * reset buttons to default, terminate pyShell process and
 * @deprecated
 */
// const terminatePyShell = (callbackfn?: Function) => {
//   isPyShellRunning = false;
//   console.log('closed here');
//   pyshell.end(() => {
//     // if (err) throw err;
//     // pyshell = null;
//     // pyshell.end is asynchronos
//     if (callbackfn) callbackfn();
//   });
//   // to create new one when user clicks play/pause button
// };

// pyshell.on('message', (...args: string[]) => {
//   if (close) {
//     console.log('should be closed');
//     pyshell.send('terminate');
//   } else if (args[0].includes('generation')) {
//     if (args[0].includes('found')) {
//       progressChart.data.labels.push(args[0].substr(19));
//       fittestChart.data.labels.push(args[0].substr(19));
//       // currentChart.data.labels.push(args[0].substr(19));
//     } else {
//       progressChart.data.labels.push(args[0].substr(12));
//       fittestChart.data.labels.push(args[0].substr(12));
//       // currentChart.data.labels.push(args[0].substr(12));
//     }
//   } else if (args[0].includes('fitness')) {
//     if (args[0].includes('found')) {
//       progressChart.data.datasets[0].data.push(parseInt(args[0].substr(22)));
//       fittestChart.data.datasets[0].data.push(parseInt(args[0].substr(22)));
//       // currentChart.data.datasets[0].data.push(parseInt(args[0].substr(22)));
//     } else {
//       progressChart.data.datasets[0].data.push(parseInt(args[0].substr(15)));
//       fittestChart.data.datasets[0].data.push(parseInt(args[0].substr(15)));
//       // currentChart.data.datasets[0].data.push(parseInt(args[0].substr(15)));
//     }
//   } else if (args[0].includes('genes')) {
//     clearChart(fittestChart);
//     genesNum = [...Array(64).keys()].map(x => ++x);
//     fittestChart.data.labels = genesNum.map(x => `${x}`);
//     fittestChart.data.datasets[0].data = args[0].includes('found')
//       ? args[0]
//           .substr(20)
//           .split('')
//           .map(x => parseInt(x))
//       : args[0]
//           .substr(13)
//           .split('')
//           .map(x => parseInt(x));
//     progressChart.update();
//     fittestChart.update();
//     // currentChart.update();
//     if (isPyShellRunning && !args[0].includes('found')) pyshell.send('');
//   } else if (args[0].includes('finished')) {
//     console.log('finished');
//     clearChart(progressChart);
//     clearChart(fittestChart);
//     setBtnsClickable(false);
//     terminatePyShell();
//     switchPlayPauseBtn();
//     blinkPlayBtn();
//     resetTime();
//   }
// });

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
const blinkPlayBtn = () => {
  playBtn.classList.add('disabled-btn');
  playBtn.disabled = true;
  setTimeout(() => {
    playBtn.classList.remove('disabled-btn');
    playBtn.disabled = false;
  }, 400);
};

/**
 * stop timer, called when the GA completed or forced to stop
 * @param v whether to reset time indicator to 00:00:00:00 after end
 */
// const resetTime = (v: boolean = false) => {
//   notifyTimer('finish');
//   deleteTimeResult = v;
// };

/**
 * sends a ipc message to mainProcess to change state of timer
 * @param state start | pause | resume | finish
 */
// const notifyTimer = (state: string) => {
//   ipcRenderer.send('time', state);
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
    // TODO: add global variable to set
    setBtnsClickable();
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
  // kill pyshell process in the state it is in
  // pyshell.terminate();
  // close = true;
  // resetTime();
  // startPyShell();
  // terminatePyShell(() => {
  //   resetTime(true);
  //   playBtn.click();
  // });
  // killing pyshell process takes time
};

stepFBtn.onclick = () => {
  stepForward();
  // pyshell paused when going next step
  isPyShellRunning = false;
  // switch to paused state
  switchPlayBtn();
  switchPlayBtn();
  // to pause the process if it's running
  // if (isPyShellRunning) playBtn.click();
};

// ipcRenderer.on('time', (_event, time: string) => {
//   document.getElementById('time').innerHTML = time;
// });

// ipcRenderer.on('cpuusage', (_event, cpuusage: string) => {
//   document.getElementById('cpuusage').innerHTML = cpuusage;
// });

// ipcRenderer.on('time-finished', () => {
//   if (deleteTimeResult)
//     document.getElementById('time').innerHTML = '00:00:00:00';
// });

// triggered to stop time calculating if the user reloads page while GA was running
// and because deleteTimeResult is true by default it's going to reset time indicator
// notifyTimer('finish');
