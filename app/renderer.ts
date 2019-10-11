// import * as Highcharts from 'highcharts';
import { ChildProcess } from 'child_process';
import { WebFrame, IpcRenderer } from 'electron';

/***************************** passed by preload *****************************
 *****************************************************************************/
/**
 * python process that executes GA
 */
let pyshell: ChildProcess = (<any>window).pyshell;

/**
 * needed to extract the value of the current frame zoom level, default is 0,
 * and each zoom in/out is addition/minus of 0.5 respectively.
 */
const webFrame: WebFrame = (<any>window).webFrame;

/**
 * allows sending resizing information to main process to resize primary &
 * secondary view
 */
const ipcRenderer: IpcRenderer = (<any>window).ipcRenderer;
/************************** GA States Changers part **************************/
/**
 * send play to GA, python side is responsible for whether to start GA for first time are just resume
 *
 * disables hover settings for charts
 */
const play: () => void = (<any>window).play;
/**
 * send pause to GA, enables hover settings for charts
 */
const pause: () => void = (<any>window).pause;
/**
 * send stop to GA, enables hover settings for charts
 */
const stop: () => void = (<any>window).stop;
/**
 * stops current GA and launches new one, disables hover settings for charts in case enabled
 */
const replay: () => void = (<any>window).replay;
/**
 * send step forward to GA, pyshell pauses GA if needed, enables tooltip for charts in case disabled
 */
const stepForward: () => void = (<any>window).stepForward;

/************************************ GUI ************************************
 *****************************************************************************/

/****************************** Control buttons ******************************/

/**
 * play/pause button, it's role (to pause/to play) depends on isRunning
 */
let playBtn = <HTMLButtonElement>document.getElementById('play-btn');
/**
 * stops the GA algorithm
 */
let stopBtn = <HTMLButtonElement>document.getElementById('stop-btn');
/**
 * restart the GA algorithm
 */
let toStartBtn = <HTMLButtonElement>document.getElementById('to-start-btn');
/**
 * step back button (not implemented)
 */
// let stepBBtn = <HTMLButtonElement>document.getElementById('step-back-btn');
/**
 * step forward button
 */
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

/******************************* Views Containers ********************************/
/**
 * the holder of the space occupied by primary chart view
 */
const prime = <HTMLDivElement>document.querySelector('.primary-container');

/**
 * the holder of the space occupied by secondary chart view
 */
const second = <HTMLDivElement>document.querySelector('.secondary-container');

window.onresize = () => {
  ipcRenderer.send('resize', {
    primary: {
      x: Math.floor(prime.getBoundingClientRect().left),
      y: Math.floor(prime.getBoundingClientRect().top),
      width: Math.floor(prime.getBoundingClientRect().width),
      height: Math.floor(prime.getBoundingClientRect().height - 1)
    },
    secondary: {
      x: Math.floor(second.getBoundingClientRect().left + 2),
      y: Math.floor(second.getBoundingClientRect().top + 1),
      width: Math.floor(second.getBoundingClientRect().width - 2),
      height: Math.floor(second.getBoundingClientRect().height - 1)
    },
    zoom: webFrame.getZoomLevel()
  });
  // console.log({
  //   primary: {
  //     x: prime.getBoundingClientRect().left,
  //     y: prime.getBoundingClientRect().top,
  //     width: prime.getBoundingClientRect().width,
  //     height: prime.getBoundingClientRect().height - 1
  //   },
  //   secondary: {
  //     x: second.getBoundingClientRect().left,
  //     y: second.getBoundingClientRect().top,
  //     width: second.getBoundingClientRect().width,
  //     height: second.getBoundingClientRect().height
  //   },
  //   zoom: webFrame.getZoomLevel()
  // });
};

/************************ Charts & Python Configuration ************************
 ******************************************************************************/

/**************************** Charts Configuration ****************************/
/**
 * updated every generation, recieves the generation with its fittest fitness
 */
// let progressChart: Highcharts.Chart;
/**
 * updated every time a new most fittest appear, recives most fittest genes
 *
 * most fittest is a new fittest which its fitness value is better than every
 * fittest in the previous generations
 */
// let fittestChart: Highcharts.Chart;
/**
 * updated every generation, recives current generation's fittest genes
 */
// let currentChart: Highcharts.Chart;

/**
 * an object that holds most fittest fitness with an array of their genes
 */
// let mostFittest: {
//   fitness: number;
//   individuals?: [
//     {
//       generation: number;
//       genes: any[];
//     }
//   ];
// } = { fitness: -1 };
/**
 * an array of for every generation fittest genes
 */
// let fittestHistory = [];

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
 * figure out what response stands for and act uppon it
 * @param response response of pyshell
 */
const treatResponse = (response: object) => {
  if (response['started'] && response['genesNum'] !== undefined) {
    // to be able to change in ga state
    setClickable();
  } else if (response['finished']) {
    setClickable(false);
  }
};

pyshell.stdout.on('data', (response: Buffer) => {
  // console.log(response.toString());
  // treatResponse(JSON.parse(response.toString()));
  response
    .toString()
    .split('\n')
    .forEach((args: string) => {
      // console.log(args);
      // sometimes args == ''(not sure why), those cases need to be ignored
      if (args) treatResponse(JSON.parse(args));
    });
});

/**
 * update charts based on args passed
 * @param args point properties to be added | GA started signal
 */
// const addToChart = (args: object) => {
//   if (
//     args['generation'] !== undefined &&
//     args['fitness'] !== undefined &&
//     args['genes'] !== undefined
//   ) {
//     // every point is added to progressChart
//     progressChart.series[0].addPoint(
//       parseInt(args['fitness']),
//       true,
//       false,
//       false
//     );
//     // every point arrives override the precedent point
//     currentChart.series[0].setData(args['genes'], true, false);

//     // register it on fittest history
//     fittestHistory.push(args['genes']);

//     if (mostFittest['fitness'] < args['fitness']) {
//       mostFittest['fitness'] = args['fitness'];
//       mostFittest['individuals'] = [
//         {
//           generation: args['generation'],
//           genes: args['genes']
//         }
//       ];
//       fittestChart.series[0].setData(
//         mostFittest.individuals[0].genes,
//         true,
//         false
//       );
//     } else if (mostFittest['fitness'] == args['fitness']) {
//       mostFittest['individuals'].unshift({
//         generation: args['generation'],
//         genes: args['genes']
//       });
//       fittestChart.series[0].setData(
//         mostFittest.individuals[0].genes,
//         true,
//         false
//       );
//     }
//   } else if (args['started'] && args['genesNum'] !== undefined) {
//     // clear past results
//     clearChart(progressChart);
//     clearChart(fittestChart);
//     clearChart(currentChart);
//     // clear fittest individuals history & mostFittest history
//     fittestHistory = [];
//     mostFittest = { fitness: -1 };
//     // setting up xAxis for fittest and current chart
//     settingXAxis(args, currentChart, fittestChart);
//     // to be able to change in ga state
//     setClickable();
//   }
// };

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
  Array.from(document.querySelector('.state-controls').children).forEach(
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
/**
 * checks if the changed input has a valid value, if true pass it to pyshell, else
 * highlight the input in red to indicate invalide value.
 * @param event keyup | change event passed when user try to change value on parameters
 */
const parameterChanged = (event: Event) => {
  // prevent valueChange from being triggered twice if user used arrow keys,
  // also ignore other keyboard keys except backspace.
  if (event.type == 'keyup')
    if (
      isNaN(parseInt((<KeyboardEvent>event).key)) &&
      (<KeyboardEvent>event).key != 'Backspace'
    )
      return;

  if (
    (isNaN(parseFloat((<HTMLInputElement>event.target).min)) ||
      parseFloat((<HTMLInputElement>event.target).value) >=
        parseFloat((<HTMLInputElement>event.target).min)) &&
    (isNaN(parseFloat((<HTMLInputElement>event.target).max)) ||
      parseFloat((<HTMLInputElement>event.target).value) <=
        parseFloat((<HTMLInputElement>event.target).max))
  ) {
    (<HTMLInputElement>event.target).style.backgroundColor = '#fff';
    pyshell.stdin.write(
      `${JSON.stringify({
        [(<HTMLInputElement>event.target).name]: parseFloat(
          (<HTMLInputElement>event.target).value
        )
        // random_pop_size: popSizeRandom.
      })}\n`,
      (error: Error) => {
        if (error) throw error;
      }
    );
  } else (<HTMLInputElement>event.target).style.backgroundColor = '#ff5a5a';
};

popSize.addEventListener('change', parameterChanged);
popSize.addEventListener('keyup', parameterChanged);

genesNum.addEventListener('change', parameterChanged);
genesNum.addEventListener('keyup', parameterChanged);

crossover.addEventListener('change', parameterChanged);
crossover.addEventListener('keyup', parameterChanged);

mutation.addEventListener('change', parameterChanged);
mutation.addEventListener('keyup', parameterChanged);

// document.addEventListener('DOMContentLoaded', function() {});
