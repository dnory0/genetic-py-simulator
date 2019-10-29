import { ChildProcess } from 'child_process';
import { IpcRenderer, WebviewTag, IpcRendererEvent, WebFrame } from 'electron';

/***************************** passed by preload *****************************
 *****************************************************************************/
/**
 * python process that executes GA
 */
let pyshell: ChildProcess = window['pyshell'];
delete window['pyshell'];
/**
 * used to listen to zoom channel for wain process to send zoom in/out/reset.
 */
let ipcRenderer: IpcRenderer = window['ipcRenderer'];
delete window['ipcRenderer'];
/**
 * used to resize window
 */
let webFrame: WebFrame = window['webFrame'];
delete window['webFrame'];

/***************************** Views Declaration *****************************
 *****************************************************************************/
/**
 * webview hosting primary chart
 */
const primary: WebviewTag = <any>document.getElementById('primary-chart');

/**
 * webview hosting secondary chart
 */
const secondary: WebviewTag = <any>document.getElementById('secondary-chart');

/************************** GA States Changers part **************************/
/**
 * send play to GA, python side is responsible for whether to start GA for first time or just resume
 *
 * disables hover settings for charts
 */
const play: () => void = window['play'];
/**
 * send pause to GA, enables hover settings for charts
 */
const pause: () => void = window['pause'];
/**
 * send stop to GA, enables hover settings for charts
 */
const stop: () => void = window['stop'];
/**
 * stops current GA and launches new one, disables hover settings for charts in case enabled
 */
const replay: () => void = window['replay'];
/**
 * send step forward to GA, pyshell pauses GA if needed, enables tooltip for charts in case disabled
 */
const stepForward: () => void = window['stepForward'];

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
let coRandom = <HTMLInputElement>(
  document.getElementById('random-crossover-rate')
);
/**
 * mutation rate, range of values is [0,1].
 */
let mutation = <HTMLInputElement>document.getElementById('mutation-rate');
/**
 * by Default is set false, if set true the true mutation rate is going to be
 * randomized between 0 and mutation passed to GA.
 */
let mutRandom = <HTMLInputElement>(
  document.getElementById('random-mutation-rate')
);
/**
 * delay rate, range of [0,1]
 */
let delay = <HTMLInputElement>document.getElementById('delay-rate');
/**
 * by Default set to false
 */
let delayRandom = <HTMLInputElement>(
  document.getElementById('random-delay-rate')
);

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
    blinkPlayBtn();
  } else if (response['stopped']) {
    setClickable(false);
  } else if (response['is_setup']) {
    console.log('setup finished');
  }
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
 * Set buttons clickable or not. Default is true.
 *
 * Note: doesn't effect play/pause and step forward button, which means
 * that they are always enabled
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
const blinkPlayBtn = () => {
  playBtn.classList.add('disabled-btn');
  playBtn.disabled = true;
  setTimeout(() => {
    playBtn.classList.remove('disabled-btn');
    playBtn.disabled = false;
  }, 400);
};

/**
 * adjust primary & secondary webviws to body's zoom
 */
let zoomViews = () => {};

/*********************** Buttons Click Event Handling ***********************/
/**
 * play and pause the pyshell when clicked with switching
 * the button image, if pyshell = undefined/null it initialize
 * a pyshell to start running and enable disabled buttons.
 */
playBtn.onclick = () => {
  if (isRunning) {
    pause();
  } else {
    play();
  }
  // isRunning switched
  isRunning = !isRunning;
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

/********************************* Views Setup *********************************/
/**
 * unlock controls and parameters adjusting for user, also set pyshell communication.
 * triggered after both webviews finish loading.
 */
let setReady = () => {
  /**
   * hopefully free some memory space.
   *
   * Note: setting setReady to undefined/null might result in error when
   * second view calling setReady finishs loading
   */
  setReady = () => {};
  // open communication
  pyshell.stdout.on('data', (response: Buffer) => {
    primary.send('data', response);
    secondary.send('data', response);
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
   * function is implemented after both webviews are fully loaded,
   */
  zoomViews = () => {
    primary.setZoomFactor(webFrame.getZoomFactor());
    secondary.setZoomFactor(webFrame.getZoomFactor());
  };

  zoomViews();
  if (document.getElementById('loading-bg')) {
    document.getElementById('loading-bg').style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(document.getElementById('loading-bg'));
    }, 0.2);
  }
  document.getElementById('main').style.opacity = '1';
  document.getElementById('main').style.pointerEvents = 'inherit';
};

/**************************** Inputs Event handling ****************************/
/**
 * checks if the changed input has a valid value, if true pass it to pyshell, else
 * highlight the input in red to indicate invalide value.
 * @param numInput    input of type number that has changed or its random flag changed
 * @param checkInput  input of type checkbox flag attached to numInput to specify whether it is random or not
 * @param evType      onkeyup | change event passed when user try to change value on one of parameters
 * @param key         keyboard key pressed on onkeyup event, if event type is change key is ignored
 */
const parameterChanged = (
  numInput: HTMLInputElement,
  checkInput: HTMLInputElement,
  evType: string,
  key?: string
) => {
  // prevent parameterChanged from being triggered twice if user used arrow keys,
  if (evType == 'keyup' && ['ArrowUp', 'ArrowDown'].includes(key)) return;

  if (
    (isNaN(parseFloat(numInput.min)) ||
      parseFloat(numInput.value) >= parseFloat(numInput.min)) &&
    (isNaN(parseFloat(numInput.max)) ||
      parseFloat(numInput.value) <= parseFloat(numInput.max))
  ) {
    numInput.style.backgroundColor = '#fff';
    pyshell.stdin.write(
      `${JSON.stringify({
        [numInput.name]: parseFloat(numInput.value),
        [checkInput.name]: checkInput.checked
      })}\n`,
      (error: Error) => {
        if (error) throw error;
      }
    );
  } else numInput.style.backgroundColor = '#ff5a5a';
};

document.addEventListener('DOMContentLoaded', function() {
  /**
   * whichever did finsh loading last is going to unlock controls for user,
   */
  primary.addEventListener('dom-ready', () => setReady());
  secondary.addEventListener('dom-ready', () => setReady());

  /**
   * listen to parameters inputs change & keonkeyup events
   */
  popSize.onkeyup = popSize.onchange = pSRandom.onchange = (event: Event) => {
    parameterChanged(popSize, pSRandom, event.type, (<KeyboardEvent>event).key);
  };
  genesNum.onkeyup = genesNum.onchange = gNRandom.onchange = (event: Event) => {
    parameterChanged(
      genesNum,
      gNRandom,
      event.type,
      (<KeyboardEvent>event).key
    );
  };

  crossover.onkeyup = crossover.onchange = coRandom.onchange = (
    event: Event
  ) => {
    parameterChanged(
      crossover,
      coRandom,
      event.type,
      (<KeyboardEvent>event).key
    );
  };

  mutation.onkeyup = mutation.onchange = mutRandom.onchange = (
    event: Event
  ) => {
    parameterChanged(
      mutation,
      mutRandom,
      event.type,
      (<KeyboardEvent>event).key
    );
  };

  delay.onkeyup = delay.onchange = delayRandom.onchange = (event: Event) => {
    parameterChanged(
      delay,
      delayRandom,
      event.type,
      (<KeyboardEvent>event).key
    );
  };

  if (window['isDev']) {
    delete window['isDev'];
    ipcRenderer.on('devTools', (_event: IpcRendererEvent, webView: string) => {
      if (webView == 'primary') primary.getWebContents().toggleDevTools();
      else if (webView == 'secondary')
        secondary.getWebContents().toggleDevTools();
    });
  }

  ipcRenderer.on('zoom', (_event: IpcRendererEvent, type: string) => {
    if (type == 'in') {
      if (webFrame.getZoomFactor() < 2)
        webFrame.setZoomFactor(webFrame.getZoomFactor() + 0.1);
    } else if (type == 'out') {
      if (webFrame.getZoomFactor() > 0.6)
        webFrame.setZoomFactor(webFrame.getZoomFactor() - 0.1);
    } else {
      webFrame.setZoomFactor(1);
    }
    zoomViews();
  });

  /**
   * terminate pyshell process with its threads on close or reload
   */
  window.addEventListener('beforeunload', () => {
    pyshell.stdin.write(`${JSON.stringify({ exit: true })}\n`);
  });
});
