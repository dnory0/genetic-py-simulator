import { IpcRenderer, WebviewTag, IpcRendererEvent, WebFrame } from 'electron';

/***************************** passed by preload *****************************
 *****************************************************************************/
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
 * webview hosting prime chart
 */
const prime: WebviewTag = <any>document.getElementById('prime-chart');

/**
 * webview hosting side chart
 */
const side: WebviewTag = <any>document.getElementById('side-chart');

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

/****************************** GA Settings ******************************/
/**
 * checkbox that acts as a switch for enabling/disabling live rendering,
 * if enabled chart updates every time a point (Generation) is added,
 * if disabled chart update when the GA is paused or stopped,
 * default is enabled
 */
let lRSwitch = <HTMLInputElement>document.getElementById('lr-enabled');

/**
 * opens GA configuration panel to configure next run of the GA.
 */
let gaCPBtn = <HTMLInputElement>document.getElementById('ga-cp-btn');

/***************************** Parameters inputs *****************************/

/**
 * number of individuals in a population, needs to be more than 1
 */
let popSize = <HTMLInputElement>document.getElementById('pop-size');
/**
 * number of genes per individual, at least needs to be set to 1.
 */
let genesNum = <HTMLInputElement>document.getElementById('genes-num');
/**
 * crossover rate, it's in ]0,1] range.
 */
let coRate = <HTMLInputElement>document.getElementById('co-rate');
/**
 * mutation rate, range of values is [0,1].
 */
let mutRate = <HTMLInputElement>document.getElementById('mut-rate');
/**
 * delay rate, range of [0,5]
 */
let delRate = <HTMLInputElement>document.getElementById('del-rate');

/**
 * running settings
 */
let settings: object = window['settings'];
// console.log(settings);

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
  if (response['started']) {
    // to be able to change in ga state
    setClickable();
  } else if (response['finished']) {
    setClickable(false);
    blinkPlayBtn();
  }
};

/************************ GUI & Buttons Configuration ************************
 *****************************************************************************/

/**
 * switch the play/pause button image depending on isRunning state.
 */
const switchPlayBtn = () => {
  (<HTMLImageElement>playBtn.querySelector('.play')).style.display = isRunning
    ? 'none'
    : 'block';
  (<HTMLImageElement>playBtn.querySelector('.pause')).style.display = isRunning
    ? 'block'
    : 'none';
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
 * adjust prime & side webviws to body's zoom
 */
let zoomViews = () => {};

/**
 * sends signal to GA, isRunning is set depending on goingToRun passed, in the end
 * it updates play/pause button.
 *
 * @param signal play | pause | stop | replay | step_f
 * @param goingToRun set to true on play and replay signal, set to false otherwise.
 */
const ctrlClicked = (signal: string, goingToRun: boolean) => {
  /**
   * if user clicked step forward button when lRSwitch is not checked,
   * chart is not going to update that, this fixes it so the live Rendering
   * is enabled for only the this step.
   */
  if (signal == 'step_f') prime.send('step-forward');
  /**
   * clicking replay button (relaunch the algorithm) might show a flash of light of
   * the chart before being removed, this alerts the prime of a replay event so it
   * prevents the flash.
   */
  if (signal == 'replay') prime.send('replay');
  /**
   * in heavy GA (GA that takes considerable amount of time to generate 1 generation)
   * buttons should be stopped on click instead of waiting GA stopped event.
   */
  if (signal == 'stop') setClickable(false);

  window['sendSig'](signal);
  isRunning = goingToRun;
  switchPlayBtn();
};

/*********************** Buttons Click Event Handling ***********************/

playBtn.onclick = () => ctrlClicked(isRunning ? 'pause' : 'play', !isRunning);

stopBtn.onclick = () => ctrlClicked('stop', false);

toStartBtn.onclick = () => ctrlClicked('replay', true);

stepFBtn.onclick = () => ctrlClicked('step_f', false);

/******** Declared Glabally to be when default settings are recieved ********/

/**
 * sends pyshel the input value & the accompanying checkbox value, also changes
 * number input background to white if needed, note that this method should only
 * be called when number input has valide value, else it might stop the GA.
 */
const sendParameter = (numInput: HTMLInputElement) => {
  numInput.style.backgroundColor = '#fff';
  window['sendSig'](
    JSON.stringify({
      [numInput.name]: parseFloat(numInput.value)
    })
  );
};

/********************************* Views Setup *********************************/
document.addEventListener('DOMContentLoaded', function loaded() {
  document.removeEventListener('DOMContentLoaded', loaded);
  (() => {
    /**
     * unlock controls and parameters adjusting for user, also set pyshell communication
     * triggered after one of the webviews finish loading.
     */
    let ready = () => {
      /**
       * triggered after both webviews finish loading.
       */
      ready = () => {
        window['affectSettings'](settings['renderer']['input'], 'main');

        // send startup settings to pyshell
        sendParameter(popSize);
        sendParameter(genesNum);
        sendParameter(coRate);
        sendParameter(mutRate);
        sendParameter(delRate);

        (() => {
          let lRSwitchUpdater = () => {
            prime.send('live-rendering', lRSwitch.checked);
          };
          lRSwitch.addEventListener('change', lRSwitchUpdater);
          lRSwitchUpdater();
        })();

        delete window['isDev'];
        delete window['settings'];
      };

      zoomViews = window['ready'](
        window['pyshell'],
        prime,
        side,
        treatResponse,
        webFrame
      );

      zoomViews();

      window['loaded']();

      delete window['ready'];
      delete window['pyshell'];
      delete window['loaded'];
    };

    /**
     * whichever did finsh loading last is going to unlock controls for user,
     */
    prime.addEventListener('dom-ready', () => ready());
    side.addEventListener('dom-ready', () => ready());
  })();

  /**************************** Inputs Event handling ****************************/

  /**
   * setup params
   */
  window['params']();
  /**
   * add functionality to update settings onchange event for inputs
   */
  window['saveSettings'](settings['renderer']['input']);

  ipcRenderer.on('zoom', (_event: IpcRendererEvent, type: string) => {
    if (type == 'in') {
      if (webFrame.getZoomFactor() < 1.8)
        webFrame.setZoomFactor(webFrame.getZoomFactor() + 0.1);
    } else if (type == 'out') {
      if (webFrame.getZoomFactor() > 0.6)
        webFrame.setZoomFactor(webFrame.getZoomFactor() - 0.1);
    } else {
      webFrame.setZoomFactor(1);
    }
    Array.from(document.getElementsByClassName('border'))
      .concat(Array.from(document.getElementsByClassName('separator')))
      .forEach((border: HTMLDivElement) => {
        let scale: string;
        if (border.classList.contains('hor')) scale = 'scaleY';
        else scale = 'scaleX';
        border.style['transform'] = `${scale}(${(webFrame.getZoomFactor() < 1.5
          ? 1
          : 2) / webFrame.getZoomFactor()})`;
      });
    zoomViews();
  });

  // add resizabality parts of the UI
  window['border']();
  delete window['border'];

  (() => {
    let main = <HTMLDivElement>document.getElementById('main');

    gaCPBtn.onclick = () => {
      ipcRenderer.send('ga-cp', settings);
      main.style.pointerEvents = 'none';
      main.style.filter = 'blur(1px)';
      ipcRenderer.once('ga-cp-finished', (_ev, newSettings: object) => {
        main.style.pointerEvents = 'all';
        main.style.filter = 'none';
        if (newSettings) {
          settings['renderer']['input'] = newSettings['renderer']['input'];
          // console.log(newSettings);
          saveSettings(settings['renderer']['input']);
          affectSettings(settings['renderer']['input'], 'main');
        }
      });
    };

    /**
     * terminate pyshell process with its threads on close or reload
     */
    window.addEventListener('beforeunload', () => {
      ipcRenderer.send('close-ga-cp');
      main.style.display = 'none';
      // window['sendSig']('exit');
    });
  })();
});

/**
 * launches once when the main process returns if the app is in development mode or production mode
 */
if (window['isDev']) {
  window['k-shorts'](prime, side, ipcRenderer);
  delete window['k-shorts'];
}

ipcRenderer.on('settings', () => ipcRenderer.send('settings', settings));
