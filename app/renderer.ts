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
 * number of individuals in a population, needs to be more than 1
 */
let popSize = <HTMLInputElement>document.getElementById('pop-size');
/**
 * by Default is set false, if set true the true population size is going to be
 * randomized between 1 and popSize passed to GA.
 */
let pSRandom = <HTMLInputElement>document.getElementById('random-pop-size');
/**
 * number of genes per individual, at least needs to be set to 1.
 */
let genesNum = <HTMLInputElement>document.getElementById('genes-num');
/**
 * by Default is set false, if set true the true genes number is going to be
 * randomized between 1 and genesNum passed to GA.
 */
let gNRandom = <HTMLInputElement>document.getElementById('random-genes-num');
/**
 * crossover rate, it's in ]0,1] range.
 */
let crossover = <HTMLInputElement>document.getElementById('crossover-rate');
/**
 * by Default is set false, if set true the true crossover rate is going to be
 * randomized between 0.001 and crossover passed to GA.
 */
let coRandom = <HTMLInputElement>document.getElementById('random-crossover-rate');
/**
 * mutation rate, range of values is [0,1].
 */
let mutation = <HTMLInputElement>document.getElementById('mutation-rate');
/**
 * by Default is set false, if set true the true mutation rate is going to be
 * randomized between 0 and mutation passed to GA.
 */
let mutRandom = <HTMLInputElement>document.getElementById('random-mutation-rate');

/******************************* Views Containers ********************************/

/**
 * the holder of the space occupied by primary chart view
 */
const prime = <HTMLDivElement>document.querySelector('.primary-container');

/**
 * the holder of the space occupied by secondary chart view
 */
const second = <HTMLDivElement>document.querySelector('.secondary-container');

/**
 * sends resize signal to main process, with primary & secondary position info, zoom
 * level of the window.
 */
const resizeReporter = () => {
  ipcRenderer.send('resize', {
    primary: {
      x: Math.floor(prime.getBoundingClientRect().left),
      y: Math.floor(prime.getBoundingClientRect().top),
      width: Math.floor(prime.offsetWidth * webFrame.getZoomFactor()),
      height: Math.floor(prime.offsetHeight * webFrame.getZoomFactor())
    },
    secondary: {
      x: Math.floor(
        second.getBoundingClientRect().left * webFrame.getZoomFactor() + 2
      ),
      y: Math.floor(
        second.getBoundingClientRect().top * webFrame.getZoomFactor() + 2
      ),
      width: Math.floor(
        second.getBoundingClientRect().width * webFrame.getZoomFactor() - 2
      ),
      height: Math.floor(
        second.getBoundingClientRect().height * webFrame.getZoomFactor() - 2
      )
    },
    zoom: webFrame.getZoomLevel()
  });
};

window.onresize = () => {
  setTimeout(resizeReporter, 40);
};

ipcRenderer.once('views-ready', resizeReporter);

/****************************** Python Part ******************************/

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
  response
    .toString()
    .split('\n')
    .forEach((args: string) => {
      console.log(args);
      // sometimes args == ''(not sure why), those cases need to be ignored
      if (args) treatResponse(JSON.parse(args));
    });
});

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
 * @param numInput    input of type number that has changed or its random flag changed
 * @param checkInput  input of type checkbox flag attached to numInput to specify whether it is random or not
 * @param evType      keyup | change event passed when user try to change value on one of parameters
 * @param key         keyboard key pressed on keyup event, if event type is change key is ignored
 */
const parameterChanged = (numInput: HTMLInputElement, checkInput: HTMLInputElement, evType: string, key?: string) => {
  // prevent parameterChanged from being triggered twice if user used arrow keys,
  // also ignore other keyboard keys except backspace.
  if (evType == 'keyup')
    if (
      isNaN(parseInt(key)) &&
      key != 'Backspace'
    )
      return;

  if (
    (isNaN(parseFloat(numInput.min)) ||
      parseFloat(numInput.value) >=
        parseFloat(numInput.min)) &&
    (isNaN(parseFloat(numInput.max)) ||
      parseFloat(numInput.value) <=
        parseFloat(numInput.max))
  ) {
    numInput.style.backgroundColor = '#fff';
    pyshell.stdin.write(
      `${JSON.stringify({
        [numInput.name]: parseFloat(
          numInput.value
        ),
        [checkInput.name]: checkInput.checked
      })}\n`,
      (error: Error) => {
        if (error) throw error;
      }
    );
  } else numInput.style.backgroundColor = '#ff5a5a';
};

popSize.onkeyup = popSize.onchange = pSRandom.onchange = (event: Event) => {
  parameterChanged(popSize, pSRandom, event.type, (<KeyboardEvent>event).key)
};

genesNum.onkeyup = genesNum.onchange = gNRandom.onchange = (event: Event) => {
  parameterChanged(genesNum, gNRandom, event.type, (<KeyboardEvent>event).key)
};

crossover.onkeyup = crossover.onchange = coRandom.onchange = (event: Event) => {
  parameterChanged(crossover, coRandom, event.type, (<KeyboardEvent>event).key)
};

mutation.onkeyup = mutation.onchange = mutRandom.onchange = (event: Event) => {
  parameterChanged(mutation, mutRandom, event.type, (<KeyboardEvent>event).key)
};

// document.addEventListener('DOMContentLoaded', function() {});

/**
 * reset zoom level on first load or reload
 */
webFrame.setZoomLevel(0);
