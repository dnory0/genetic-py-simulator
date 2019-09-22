import { ipcRenderer, remote } from 'electron';
import { join } from 'path';
import * as Highcharts from 'highcharts';
import { spawn, ChildProcess } from 'child_process';
import { copyFileSync } from 'fs';

/**
 * return true if app on developement, false in production.
 * NOTE: app needs to be packed on asar (by default) to be possible to detect
 * if you don't set asar to false on electron-builder.json you're good to go
 */
function isDev() {
  return process.mainModule.filename.indexOf('.asar') === -1;
}

// require('highcharts/modules/exporting')(Highcharts);
// require('highcharts/')

let playBtn = <HTMLButtonElement>document.getElementById('play-btn');
let stopBtn = <HTMLButtonElement>document.getElementById('stop-btn');
// restart the GA algorithm
let toStartBtn = <HTMLButtonElement>document.getElementById('to-start-btn');
// step back button (not implemented)
// let stepBBtn = <HTMLButtonElement>document.getElementById('step-back-btn');
// step forward button
let stepFBtn = <HTMLButtonElement>document.getElementById('step-forward-btn');

/************************ Python & Chart Configuration ************************
 ******************************************************************************/
// updated with fittest per generation
let progressChart: Highcharts.Chart;
// updated with fittest genes
let fittestChart: Highcharts.Chart;
// updated with fittest genes per generation
let currentChart: Highcharts.Chart;

// an object that holds most fittest fitness with an array of their genes
let mostFittest: {
  fitness: number;
  individuals?: [
    {
      generation: number;
      genes: any[];
    }
  ];
} = { fitness: -1 };
// an array of for every generation fittest genes
let fittestsHistory = [];

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

const settingXaxis = (args: object, ...charts: Highcharts.Chart[]) => {
  const genes = [...Array(args['genesNum']).keys()].map(v => `${++v}`);
  charts.forEach(chart => {
    chart.xAxis[0].setCategories(genes);
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
    progressChart.series[0].addPoint(
      parseInt(args['fitness']),
      true,
      false,
      false
    );
    currentChart.series[0].setData(args['genes'], true, false);

    // register it on fittest history
    fittestsHistory.push(args['genes']);
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
    fittestsHistory = [];
    mostFittest = { fitness: -1 };
    // setting up xAxis for fittest and current chart
    settingXaxis(args, currentChart, fittestChart);
    // to be able to change in ga state
    setClickable();
  }
};

if (isDev()) {
  pyshell = spawn(`python3`, [join(__dirname, 'python', 'ga.py')]);
} else {
  copyFileSync(
    join(__dirname, 'python', 'dist', 'ga'),
    join(remote.app.getPath('temp'), 'ga')
  );
  pyshell = spawn(`${join(remote.app.getPath('temp'), 'ga')}`);
}

pyshell.stdout.on('data', (passedArgs: Buffer) => {
  passedArgs
    .toString()
    .split('\n')
    .forEach((args: string) => {
      // sometimes args == ''(not sure why), those cases need to be ignored
      if (args) addToChart(JSON.parse(args));
    });
});
pyshell.on('error', (err: Error) => console.error(`error trace: ${err}`));

/************************* Buttons part *************************/
/**
 * send play to GA, python side is responsible for whether
 * to start GA for first time are just resume
 */
const play = () => {
  pyshell.stdin.write('"play"\n');
};

/**
 * send pause to GA
 */
const pause = () => {
  pyshell.stdin.write('"pause"\n');
};

/**
 * send stop to GA
 */
const stop = () => {
  pyshell.stdin.write('"stop"\n');
};

/**
 * stops current GA and launchs new one
 */
const replay = () => {
  pyshell.stdin.write('"replay"\n');
};

/**
 * send step forward to GA, pyshell pauses GA if needed
 */
const stepForward = () => {
  pyshell.stdin.write('"step_f"\n');
};

/**
 * exit the GA and kill spawned process, usually called on exit or reload app.
 */
const exit = () => {
  pyshell.stdin.write('"exit"\n');
};

/************************ GUI & Buttons Configuration ************************
 *****************************************************************************/

/**
 * switch the play/pause button image depending on
 * isRunning state.
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

/**
 * triggered when app going to exit or reload
 */
ipcRenderer.on('pyshell', () => {
  exit();
});

// document.addEventListener('DOMContentLoaded', function() {});
