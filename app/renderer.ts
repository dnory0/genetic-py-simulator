import { ipcRenderer, remote } from 'electron';
import { join } from 'path';
import * as Highcharts from 'highcharts';
import { ChildProcess, spawn } from 'child_process';
import { copyFileSync, existsSync } from 'fs';

/**
 * return true if app on development, false in production.
 *
 * NOTE: app needs to be packed on asar (by default) to be possible to detect
 * if you don't set asar to false on electron-builder.json you're good to go
 */
function isDev() {
  return process.mainModule.filename.indexOf('.asar') === -1;
}

// require('highcharts/modules/exporting')(Highcharts);
// require('highcharts/')

/****************************** Control buttons ******************************/

let playBtn = <HTMLButtonElement>document.getElementById('play-btn');
let stopBtn = <HTMLButtonElement>document.getElementById('stop-btn');
// restart the GA algorithm
let toStartBtn = <HTMLButtonElement>document.getElementById('to-start-btn');
// step back button (not implemented)
// let stepBBtn = <HTMLButtonElement>document.getElementById('step-back-btn');
// step forward button
let stepFBtn = <HTMLButtonElement>document.getElementById('step-forward-btn');

/***************************** Parameters inputs *****************************/

/**
 * number of individuals in a population, needs to be more than 120
 */
let popSize = <HTMLInputElement>document.getElementById('pop-size');
/**
 * by Default is set false, if set true the true population size is going to be
 * randomized between 120 and popSize passed to GA.
 */
let pSRandom = <HTMLButtonElement>document.getElementById('random-pop-size');
/**
 * number of genes per individual, at least needs to be set to 80.
 */
let genesNum = <HTMLInputElement>document.getElementById('genes-num');
/**
 * by Default is set false, if set true the true genes number is going to be
 * randomized between 80 and genesNum passed to GA.
 */
let gNRandom = <HTMLButtonElement>document.getElementById('random-genes-num');
/**
 * crossover rate, it's in ]0,1] range.
 */
let crossover = <HTMLInputElement>document.getElementById('crossover-rate');
/**
 * by Default is set false, if set true the true crossover rate is going to be
 * randomized between 0.001 and crossover passed to GA.
 */
let coRandom = <HTMLButtonElement>document.getElementById('random-crossover');
/**
 * mutation rate, range of values is [0,1].
 */
let mutation = <HTMLInputElement>document.getElementById('mutation-rate');
/**
 * by Default is set false, if set true the true mutation rate is going to be
 * randomized between 0 and mutation passed to GA.
 */
let mutRandom = <HTMLButtonElement>document.getElementById('random-mutation');

/************************ Python & Chart Configuration ************************
 ******************************************************************************/
/**
 * updated with fittest per generation
 */
let progressChart: Highcharts.Chart;
/**
 * updated with fittest genes
 */
let fittestChart: Highcharts.Chart;
/**
 * updated with fittest genes per generation
 */
let currentChart: Highcharts.Chart;

/**
 * an object that holds most fittest fitness with an array of their genes
 */
let mostFittest: {
  fitness: number;
  individuals?: [
    {
      generation: number;
      genes: any[];
    }
  ];
} = { fitness: -1 };
/**
 * an array of for every generation fittest genes
 */
let fittestHistory = [];

/**
 * initialize a chart and pass it options
 * @param containerId id of html div tag that is going to contain chart
 * @param options chart options, see Highcharts.Options
 *
 * @returns set up chart
 */
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
  ] as Highcharts.SeriesLineOptions[]
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

/**
 * set up X axis with genes numeration 1 2 .. <genes number>
 * @param args contains genes number that's needed to set up X axis of charts
 * @param charts charts to set its X axis
 */
const settingXaxis = (args: object, ...charts: Highcharts.Chart[]) => {
  const genes = [...Array(args['genesNum']).keys()].map(v => `${++v}`);
  charts.forEach(chart => {
    chart.xAxis[0].setCategories(genes);
  });
};

/**
 * enables or disable the hover settings for the passed charts
 * @param enable decides if to disable hover settings or enable them.
 * @param charts charts to apply hover settings on
 */
const enableChartHover = (enable: boolean, ...charts: Highcharts.Chart[]) => {
  charts.forEach((chart: Highcharts.Chart) => {
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
  });
};

const clearChart = (chart: Highcharts.Chart, categories: boolean = true) => {
  if (categories) chart.xAxis[0].setCategories([]);
  chart.series[0].setData([]);
  chart.redraw();
};

/****************************** Python Part ******************************/

// used as args for pyshell
// let args = [
//   '64' /* Default genes number */,
//   '120' /* Default population size */
// ];
/**
 * by default user needs to hit the play button to run pyshell
 */
let isRunning = false;

/**
 * declared and initialized globally
 */
let pyshell: ChildProcess;

/**
 * update charts based on args passed
 * @param args point properties to be added | GA started signal
 */
const addToChart = (args: object) => {
  if (
    args['generation'] !== undefined &&
    args['fitness'] !== undefined &&
    args['genes'] !== undefined
  ) {
    // every point is added to progressChart
    progressChart.series[0].addPoint(
      parseInt(args['fitness']),
      true,
      false,
      false
    );
    // every point arrives override the precedent point
    currentChart.series[0].setData(args['genes'], true, false);

    // register it on fittest history
    fittestHistory.push(args['genes']);

    if (mostFittest['fitness'] < args['fitness']) {
      mostFittest['fitness'] = args['fitness'];
      mostFittest['individuals'] = [
        {
          generation: args['generation'],
          genes: args['genes']
        }
      ];
      fittestChart.series[0].setData(
        mostFittest.individuals[0].genes,
        true,
        false
      );
    } else if (mostFittest['fitness'] == args['fitness']) {
      mostFittest['individuals'].unshift({
        generation: args['generation'],
        genes: args['genes']
      });
      fittestChart.series[0].setData(
        mostFittest.individuals[0].genes,
        true,
        false
      );
    }
  } else if (args['started'] && args['genesNum'] !== undefined) {
    // clear past results
    clearChart(progressChart);
    clearChart(fittestChart);
    clearChart(currentChart);
    // clear fittest individuals history & mostFittest history
    fittestHistory = [];
    mostFittest = { fitness: -1 };
    // setting up xAxis for fittest and current chart
    settingXaxis(args, currentChart, fittestChart);
    // to be able to change in ga state
    setClickable();
  }
};

// if in development
if (isDev()) {
  // works with the script version
  pyshell = spawn(`${process.platform == 'win32' ? 'python' : 'python3'}`, [
    join(__dirname, 'python', 'ga.py')
  ]);
} else {
  /**
   * path of executable/script to copy
   */
  let copyFrom: string;
  /**
   * temp directory which the executable/script is going to be copied to
   */
  let copyTo: string;
  /**
   * set to true if executable is available
   */
  let execExist = existsSync(
    join(
      __dirname,
      'python',
      'dist',
      process.platform == 'win32' ? join('win', 'ga.exe') : join('linux', 'ga')
    )
  );

  if (execExist) {
    copyFrom = join(
      __dirname,
      'python',
      'dist',
      process.platform == 'win32' ? join('win', 'ga.exe') : join('linux', 'ga')
    );
    copyTo = join(
      remote.app.getPath('temp'),
      process.platform == 'win32' ? 'ga.exe' : 'ga'
    );
  } else {
    copyFrom = join(__dirname, 'python', 'ga.py');
    copyTo = join(remote.app.getPath('temp'), 'ga.py');
  }
  // works with the executable version
  copyFileSync(copyFrom, copyTo);
  pyshell = spawn(
    execExist
      ? copyTo
      : `${process.platform == 'win32' ? 'python' : 'python3'}`,
    execExist ? [] : [copyTo]
  );
}

pyshell.stdout.on('data', (passedArgs: Buffer) => {
  passedArgs
    .toString()
    .split('\n')
    .forEach((args: string) => {
      // console.log(args);
      // sometimes args == ''(not sure why), those cases need to be ignored
      if (args) addToChart(JSON.parse(args));
    });
});
pyshell.on('error', (err: Error) => console.error(`error trace: ${err}`));

/************************* Buttons part *************************/
/**
 * send play to GA, python side is responsible for whether to start GA for first time are just resume
 *
 * disables hover settings for charts
 */
const play = () => {
  pyshell.stdin.write(`${JSON.stringify({ play: true })}\n`);
  enableChartHover(false, progressChart, fittestChart, currentChart);
};

/**
 * send pause to GA, enables hover settings for charts
 */
const pause = () => {
  pyshell.stdin.write(`${JSON.stringify({ pause: true })}\n`);
  enableChartHover(true, progressChart, fittestChart, currentChart);
};

/**
 * send stop to GA, enables hover settings for charts
 */
const stop = () => {
  pyshell.stdin.write(`${JSON.stringify({ stop: true })}\n`);
  enableChartHover(true, progressChart, fittestChart, currentChart);
};

/**
 * stops current GA and launches new one, disables hover settings for charts in case enabled
 */
const replay = () => {
  pyshell.stdin.write(`${JSON.stringify({ replay: true })}\n`);
  enableChartHover(false, progressChart, fittestChart, currentChart);
};

/**
 * send step forward to GA, pyshell pauses GA if needed, enables tooltip for charts in case disabled
 */
const stepForward = () => {
  pyshell.stdin.write(`${JSON.stringify({ step_f: true })}\n`);
  enableChartHover(true, progressChart, fittestChart, currentChart);
};

/**
 * exit the GA and kill spawned process, usually called on exit or reload app.
 */
const exit = () => {
  pyshell.stdin.write(`${JSON.stringify({ exit: true })}\n`);
};

/************************ GUI & Buttons Configuration ************************
 *****************************************************************************/

/**
 * switch the play/pause button image depending on isRunning state.
 */
const switchBtn = () => {
  if (isRunning) {
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
const setClickable = (clickable = true) => {
  Array.from(document.querySelector('.controls').children).forEach(
    (element, index) => {
      // to not effect play/pause and step forward button.
      if ([0, 4].includes(index)) return;
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
  // isRunning switched
  isRunning = !isRunning;
  if (isRunning) {
    play();
  } else {
    pause();
  }
  switchBtn();
};

stopBtn.onclick = () => {
  setClickable(false);
  stop();
  // doesn't effect if pyshell is paused
  isRunning = false;
  // switch play/pause button to play state if needed
  switchBtn();
};

toStartBtn.onclick = () => {
  replay();
  // in case pyshell was paused before
  isRunning = true;
  switchBtn();
};

stepFBtn.onclick = () => {
  stepForward();
  // pyshell paused when going next step
  isRunning = false;
  // switch to paused state
  switchBtn();
};

/**************************** Inputs Event handling ****************************/

popSize.addEventListener('keyup', event => {
  if (parseInt(popSize.value) >= 120) {
    popSize.style.backgroundColor = '#fff';
    pyshell.stdin.write(
      `${JSON.stringify({
        pop_size: parseInt(popSize.value)
        // random_pop_size: popSizeRandom.
      })}\n`,
      (error: Error) => {
        if (error) throw error;
      }
    );
  } else popSize.style.backgroundColor = '#ff5a5a';
});

genesNum.addEventListener('keyup', event => {
  if (parseInt(genesNum.value) >= 80) {
    genesNum.style.backgroundColor = '#fff';
    pyshell.stdin.write(
      `${JSON.stringify({
        genes_num: parseInt(genesNum.value)
        // random_pop_size: popSizeRandom.
      })}\n`,
      (error: Error) => {
        if (error) throw error;
      }
    );
  } else genesNum.style.backgroundColor = '#ff5a5a';
});

crossover.addEventListener('keyup', event => {
  if (parseFloat(crossover.value) > 0 && parseFloat(crossover.value) <= 1) {
    crossover.style.backgroundColor = '#fff';
    pyshell.stdin.write(
      `${JSON.stringify({
        crossover_rate: parseFloat(crossover.value)
        // random_pop_size: popSizeRandom.
      })}\n`,
      (error: Error) => {
        if (error) throw error;
      }
    );
  } else crossover.style.backgroundColor = '#ff5a5a';
});

mutation.addEventListener('keyup', event => {
  if (parseFloat(mutation.value) >= 0 && parseFloat(mutation.value) <= 1) {
    mutation.style.backgroundColor = '#fff';
    pyshell.stdin.write(
      `${JSON.stringify({
        mutation_rate: parseFloat(mutation.value)
        // random_pop_size: popSizeRandom.
      })}\n`,
      (error: Error) => {
        if (error) throw error;
      }
    );
  } else mutation.style.backgroundColor = '#ff5a5a';
});

/**
 * triggered when app going to exit or reload
 */
ipcRenderer.on('pyshell', () => {
  exit();
});

// document.addEventListener('DOMContentLoaded', function() {});
