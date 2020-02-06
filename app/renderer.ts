import { ChildProcess } from 'child_process';
import { IpcRenderer, WebviewTag, IpcRendererEvent, WebFrame } from 'electron';

/***************************** passed by preload *****************************
 *****************************************************************************/
/**
 * python process that executes GA
 */
let pyshell: ChildProcess;
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

/****************************** GA Settings ******************************/
/**
 * checkbox that acts as a switch for enabling/disabling live rendering,
 * if enabled chart updates every time a point (Generation) is added,
 * if disabled chart update when the GA is paused or stopped,
 * default is enabled
 */
let lRSwitch = <HTMLInputElement>document.getElementById('live-rendering');

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
  if (signal == 'step_f' && !lRSwitch.checked) prime.send('step-forward');

  window['sendSig'](signal);
  isRunning = goingToRun;
  switchPlayBtn();
};

/*********************** Buttons Click Event Handling ***********************/

playBtn.onclick = () => ctrlClicked(isRunning ? 'pause' : 'play', !isRunning);

stopBtn.onclick = () => ctrlClicked('stop', false);

toStartBtn.onclick = () => ctrlClicked('replay', true);

stepFBtn.onclick = () => ctrlClicked('step_f', false);

/********************************* Views Setup *********************************/
document.addEventListener('DOMContentLoaded', function loaded() {
  document.removeEventListener('DOMContentLoaded', loaded);
  (() => {
    /**
     * unlock controls and parameters adjusting for user, also set pyshell communication
     * triggered after both webviews finish loading.
     */
    let ready = () => {
      /**
       * hopefully free some memory space.
       *
       * Note: setting ready to undefined/null might result in error when
       * second view finishs loading
       */
      ready = () => {
        prime.send('mode', window['isDev']);
        side.send('mode', window['isDev']);
        delete window['isDev'];

        lRSwitch.onchange = () => prime.send('update-mode', lRSwitch.checked);
      };

      zoomViews = window['ready'](
        pyshell,
        prime,
        side,
        treatResponse,
        webFrame
      );
      zoomViews();
      window['loaded']();
      delete window['ready'];
      delete window['loaded'];
    };

    /**
     * whichever did finsh loading last is going to unlock controls for user,
     */
    prime.addEventListener('dom-ready', () => ready());
    side.addEventListener('dom-ready', () => ready());
  })();
  /**************************** Ranges change handling ****************************/

  /**
   * sends pyshel the input value & the accompanying checkbox value, also changes
   * number input background to white if needed, note that this method should only
   * be called when number input has valide value, else it might stop the GA.
   */
  const sendParameter = (
    numInput: HTMLInputElement,
    checkInput: HTMLInputElement
  ) => {
    numInput.style.backgroundColor = '#fff';
    window['sendSig'](
      JSON.stringify({
        [numInput.name]: parseFloat(numInput.value),
        [checkInput.name]: checkInput.checked
      })
    );
  };

  /**
   * called when range inputs change value, to update accompanying number input & pass
   * the new value to GA.
   */
  const rangeChange = (
    rangeInput: HTMLInputElement,
    numberInput: HTMLInputElement,
    checkbox: HTMLInputElement
  ) => {
    setTimeout(() => {
      numberInput.value = rangeInput.value;
      sendParameter(numberInput, checkbox);
    }, 0);
  };

  /**
   * called when number input change, consequently its either crossover, mutation or
   * delay input to update the accompanying range input with its value.
   */
  const numberChange = (
    rangeInput: HTMLInputElement,
    numberInput: HTMLInputElement
  ) => {
    setTimeout(() => {
      rangeInput.value = numberInput.value;
    }, 0);
  };

  Array.from(document.getElementsByClassName('input-wrapper')).forEach(
    (wrapper: HTMLDivElement) => {
      const first = <HTMLInputElement>wrapper.firstElementChild;
      const last = <HTMLInputElement>wrapper.lastElementChild;
      const checkbox = <HTMLInputElement>(
        wrapper.nextElementSibling.firstElementChild
      );
      first.onmousedown = () => {
        first.onmousemove = () => rangeChange(first, last, checkbox);
        // user could just click without move after click
        rangeChange(first, last, checkbox);
        // clean events on mouse up
        first.onmouseup = () => (first.onmouseup = first.onmousemove = null);
      };
    }
  );

  /**************************** Inputs Event handling ****************************/
  /**
   * checks if the changed input has a valid value, if true pass it to pyshell, else
   * highlight the input in red to indicate invalide value.
   * @param numInput    input of type number
   * @param checkInput  input of type checkbox
   * @param mustBeInt   must be integer flag, if triggered value should not contain dot '.'
   * @param event       keyboard key pressed
   */
  const parameterChanged = (
    numInput: HTMLInputElement,
    checkInput: HTMLInputElement,
    mustBeInt: boolean,
    event: Event
  ) => {
    setTimeout(() => {
      if (
        isNaN(<any>numInput.value) ||
        [
          'Control',
          'Shift',
          'Alt',
          'CapsLock',
          'AltGraph',
          'Tab',
          'Enter',
          'ArrowLeft',
          'ArrowRight',
          'Home',
          'End'
        ].includes((<KeyboardEvent>event).key)
      )
        return;

      /**
       * if mustBeInt than:
       *    - if parsing int is not NaN && the fractional part is equal to zero, than it's
       *      safe to delete it with its period.
       */
      if (
        mustBeInt &&
        !isNaN(parseInt(numInput.value)) &&
        parseInt(numInput.value) == <any>numInput.value
      ) {
        // this removes the last period
        numInput.value = `${parseInt(numInput.value) + 1}`;
        numInput.value = `${parseInt(numInput.value) - 1}`;
      }

      /**
       * if mustBeInt is true than:
       *    - last entered key must not be a period '.'.
       *    - the numInput itself shoold not have the period too.
       *    Note: those two conditions above are necessary since input type number behavior is
       *      a little unexpected and if input ends with period it is not going to show it when
       *      trying to access input value so in that case we need to compte on event.key to
       *      not be a period.
       * else these conditions are not necessary.
       * all inputs type number needs to be greater than or equal to mox and less than or equal
       * to the min.
       */
      if (
        ((mustBeInt && !numInput.value.includes('.')) || !mustBeInt) &&
        (isNaN(parseFloat(numInput.min)) ||
          parseFloat(numInput.value) >= parseFloat(numInput.min)) &&
        (isNaN(parseFloat(numInput.max)) ||
          parseFloat(numInput.value) <= parseFloat(numInput.max))
      ) {
        sendParameter(numInput, checkInput);
        // should be called only on number inputs with range inputs beside them
        if (!mustBeInt)
          numberChange(
            <HTMLInputElement>numInput.previousElementSibling,
            numInput
          );
      } else numInput.style.backgroundColor = '#ff4343b8';
    }, 0);
  };
  /**
   * listen to parameters inputs change & keonkeyup events
   */
  popSize.onkeyup = pSRandom.onchange = (event: Event) => {
    parameterChanged(popSize, pSRandom, true, event);
  };
  genesNum.onkeyup = gNRandom.onchange = (event: Event) => {
    parameterChanged(genesNum, gNRandom, true, event);
  };

  crossover.onkeyup = coRandom.onchange = (event: Event) => {
    parameterChanged(crossover, coRandom, false, event);
  };

  mutation.onkeyup = mutRandom.onchange = (event: Event) => {
    parameterChanged(mutation, mutRandom, false, event);
  };

  delay.onkeyup = delayRandom.onchange = (event: Event) => {
    parameterChanged(delay, delayRandom, false, event);
  };

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

  /**
   * terminate pyshell process with its threads on close or reload
   */
  window.addEventListener('beforeunload', () => window['sendSig']('exit'));
});

// request mode
ipcRenderer.send('mode');

/**
 * launches once when the main process returns if the app is in development mode or production mode
 */
ipcRenderer.once('mode', (_ev, isDev: boolean) => {
  if (isDev) {
    window['k-shorts'](prime, side, ipcRenderer);
    delete window['k-shorts'];
  }
  window['isDev'] = isDev;
  pyshell = window['pyshell'];
  delete window['pyshell'];
});
