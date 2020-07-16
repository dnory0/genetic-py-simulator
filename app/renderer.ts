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
/**
 * red dot div that is shown only when load path inputs data is not loaded
 */
let redDot = <HTMLDivElement>document.getElementById('red-dot');

/***************************** Parameters inputs *****************************/
/**
 * ga input parameters.
 */
let gaParams = <HTMLInputElement[]>(
  (<HTMLDivElement[]>Array.from(document.getElementsByClassName('param-value')))
    .filter(
      paramValue => paramValue.firstElementChild.tagName.toLowerCase() == 'input' || paramValue.classList.contains('double-sync')
    )
    .map(paramValue =>
      paramValue.classList.contains('double-sync')
        ? paramValue.querySelector('input.double-sync:not(:disabled)')
        : paramValue.firstElementChild
    )
);
/**
 * radio buttons for crossover/mutation types and update population param
 */
let gaTypes = (<HTMLDivElement[]>Array.from(document.getElementsByClassName('type-value')))
  .reduce((accum: Element[], typeValue) => accum.concat(...Array.from(typeValue.children)), [])
  .map((label: HTMLLabelElement) => <HTMLInputElement>label.firstElementChild)
  .concat(...(<HTMLInputElement[]>Array.from(document.getElementsByName('update_pop'))));
/**
 * running settings
 */
let settings: object = window['settings'];

/****************************** Python Part ******************************/

/**
 * by default user needs to hit the play button to run pyshell
 */
let isRunning = false;

let isGACPOpen = false;

/**
 * toggles ```disable-on-run```, if activate is true it activates
 * inputs with their random buttons, else it disactivates them.
 *
 * @param activate default is true
 */
let toggleDisableOnRun = (activate = true) => {
  gaParams.forEach(gaParam => {
    if (!gaParam.classList.contains('disable-on-run')) return;
    settings['renderer']['input'][gaParam.id]['disable'] = !activate;
    gaParam.disabled = !activate;
    (<HTMLButtonElement>gaParam.parentElement.nextElementSibling.firstElementChild).disabled = !activate;
    gaParam.parentElement.parentElement.title = activate ? '' : 'Disabled when GA is Running';
  });

  settings['renderer']['input'][gaTypes[0].name.replace('_', '-')]['disable'] = !activate;
  gaTypes.forEach(gaType => {
    if (gaType.name == 'update_pop') return;
    gaType.disabled = !activate;
    gaType.parentElement.parentElement.title = activate ? '' : 'Disabled when GA is Running';
  });

  // in case ga has finished because of generation reached max_gen while GACP is open
  // renderer should inform GACP to enable .disable-on-run inputs
  if (activate && isGACPOpen) ipcRenderer.send('ga-cp', activate);
};

/**
 * figure out what response stands for and act uppon it
 * @param response response of pyshell
 */
const treatResponse = (response: object) => {
  if (response['started']) {
    toggleDisableOnRun(false);
    // to be able to change in ga state
    setClickable();
  } else if (response['finished']) {
    isRunning = false;
    setClickable(isRunning);
    blinkPlayBtn();
    toggleDisableOnRun(true);
    switchPlayBtn();
  } else if (response['forced-pause']) {
    // if paused by pause generation parameter
    isRunning = false;
    blinkPlayBtn();
    switchPlayBtn();
  }
};

/************************ GUI & Buttons Configuration ************************
 *****************************************************************************/

/**
 * switch the play/pause button image depending on isRunning state.
 */
const switchPlayBtn = () => {
  (<HTMLImageElement>playBtn.querySelector('.play')).classList.toggle('hide', isRunning);
  (<HTMLImageElement>playBtn.querySelector('.pause')).classList.toggle('hide', !isRunning);
};

/**
 * Set buttons clickable or not. Default is true.
 *
 * Note: doesn't effect play/pause and step forward button, which means
 * that they are always enabled
 */
const setClickable = (clickable = true) => {
  Array.from(document.querySelector('.state-controls').children).forEach((element, index) => {
    // to not effect play/pause and step forward button.
    if ([0, 4].includes(index)) return;
    // disabled-btn class sets opacity to 0.6.
    if (clickable) (<HTMLButtonElement>element).classList.remove('disabled-btn');
    else (<HTMLButtonElement>element).classList.add('disabled-btn');
    (<HTMLButtonElement>element).disabled = !clickable;
  });
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
  if (signal == 'stop') {
    setClickable(goingToRun);
    toggleDisableOnRun(true);
  }

  window['sendSig'](signal);
  isRunning = goingToRun;
  switchPlayBtn();
};

/*********************** Buttons Click Event Handling ***********************/

playBtn.onclick = () => ctrlClicked(isRunning ? 'pause' : 'play', !isRunning);

stopBtn.onclick = () => ctrlClicked('stop', false);

toStartBtn.onclick = () => ctrlClicked('replay', true);

stepFBtn.onclick = () => ctrlClicked('step_f', false);

// chart actions functionality
(() => {
  function toggleFullscreen(fscreenBtn: HTMLButtonElement) {
    if (document.fullscreenElement) document.exitFullscreen();
    else fscreenBtn.parentElement.parentElement.requestFullscreen();
  }
  // full screen
  Array.from(document.getElementsByClassName('fscreen-btn')).forEach((fscreenBtn: HTMLButtonElement) => {
    fscreenBtn.onclick = () => toggleFullscreen(fscreenBtn);
  });

  let clean = (eventListener: EventListener) => {
    Array.from(document.getElementsByClassName('resize-cover')).forEach((resizeCover: HTMLDivElement) => {
      resizeCover.classList.add('hide');
    });
    window.removeEventListener('click', eventListener);
  };

  // export to file functionality
  Array.from(document.getElementsByClassName('drop-btn')).forEach((exportBtn: HTMLButtonElement) => {
    let dropdownContent = <HTMLDivElement>exportBtn.nextElementSibling;
    let dropdownPointer = <HTMLDivElement>dropdownContent.nextElementSibling;
    let exportTypes = Array.from(dropdownContent.children);
    let eventListener = () => {
      dropdownPointer.classList.toggle('hide', true);
      dropdownContent.classList.toggle('hide', true);
      clean(eventListener);
    };

    exportBtn.addEventListener('click', () => {
      dropdownPointer.classList.toggle('hide');
      dropdownContent.classList.toggle('hide');
      Array.from(document.getElementsByClassName('resize-cover')).forEach((resizeCover: HTMLDivElement) => {
        resizeCover.classList.remove('hide');
      });

      if (dropdownContent.classList.contains('hide')) clean(eventListener);
      else {
        setTimeout(() => {
          window.addEventListener('click', eventListener);
        }, 0);
      }
    });

    exportTypes.forEach((exportType: HTMLButtonElement, index) => {
      if (index == 0) {
        let mouseoverEventListener = () => {
          exportType.style.backgroundColor = '#d9d9d9';

          dropdownPointer.style.backgroundColor = '#d9d9d9';
        };
        let mouseleaveEventListener = () => {
          exportType.style.backgroundColor = 'white';
          dropdownPointer.style.backgroundColor = 'white';
        };
        exportType.addEventListener('mouseover', mouseoverEventListener);
        exportType.addEventListener('mouseleave', mouseleaveEventListener);
        dropdownPointer.addEventListener('mouseover', mouseoverEventListener);
        dropdownPointer.addEventListener('mouseleave', mouseleaveEventListener);

        dropdownPointer.addEventListener('click', () => exportType.click());
      }
      exportType.addEventListener('click', () => {
        clean(eventListener);
        if (exportBtn.classList.contains('prime')) prime.send('export', exportType.id.replace('export-', ''));
        else side.send('export', exportType.id.replace('export-', ''));
        exportBtn.click();
      });
    });
  });

  (<HTMLButtonElement[]>Array.from(document.getElementsByClassName('zoom-out-btn'))).forEach(zoomOutBtn => {
    zoomOutBtn.addEventListener('click', () => {
      if (zoomOutBtn.classList.contains('prime')) prime.send('zoom-out');
      else side.send('zoom-out');
    });
  });
})();

// controls pane hide and show functionality
(() => {
  let contCont = <HTMLDivElement>document.querySelector('.controls-container');
  let borderHide = <HTMLDivElement>document.querySelector('.border-hide');
  let hidePane = <HTMLButtonElement>document.getElementById('pane-hide-btn');
  let showPane = <HTMLButtonElement>document.getElementById('pane-show-btn');

  const togglePane = (ev: MouseEvent) => {
    const hide = (<HTMLButtonElement>ev.currentTarget).id == 'pane-hide-btn';
    showPane.parentElement.classList.toggle('hide', !hide);
    contCont.classList.toggle('hide', hide);
    borderHide.classList.toggle('hide', hide);
  };

  hidePane.onclick = togglePane;
  showPane.onclick = togglePane;
})();
/******** Declared Glabally to be when default settings are recieved ********/

/**
 * sends pyshel the input value & the accompanying checkbox value, also changes
 * number input background to white if needed, note that this method should only
 * be called when number input has valide value, else it might stop the GA.
 */
const sendParameter = (key: string, value: any) => {
  window['sendSig'](
    JSON.stringify({
      [key]: parseFloat(value) || value,
    })
  );
};

/**
 * checks if genes data and fitness function are loaded or not, and toggles the red dot
 * above settings icon if anything not loaded.
 */
let toggleRedDot = () => {
  let inputsSettings = <object>settings['renderer']['input'];
  for (let inputId in inputsSettings) {
    if (inputId.match(/.*-path/) && inputsSettings[inputId]['data'] == undefined) {
      redDot.classList.toggle('hide', false);
      return;
    }
  }
  redDot.classList.toggle('hide', true);
};

/**
 * sends updates to ga after affecting settings to gaParams
 */
let sendParams = () => {
  gaParams.forEach(gaParam => {
    let value =
      gaParam.classList.contains('is-disable-able') &&
      !(<HTMLInputElement>gaParam.parentElement.parentElement.parentElement.previousElementSibling).checked
        ? false
        : gaParam.value;
    sendParameter(gaParam.name, value);
  });

  gaTypes.filter(gaType => gaType.checked).forEach(gaType => sendParameter(gaType.name, gaType.value));
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
        // checks for missing data due to not being loaded by user
        toggleRedDot();
        // send startup settings to pyshell
        sendParams();

        (() => {
          let eventListener = (ev: Event) => {
            let gaParam = <HTMLInputElement>ev.target;
            sendParameter(gaParam.name, gaParam.value);
          };
          /**
           * update ga when parameters change values
           */
          gaParams.forEach(gaParam => {
            gaParam.addEventListener('keyup', eventListener);
            if (gaParam.classList.contains('textfieldable')) gaParam.addEventListener('change', eventListener);
          });

          gaTypes.forEach(gaType => {
            if (gaType.name == 'update_pop') gaType.addEventListener('change', eventListener);
          });

          let lRSwitchUpdater = () => {
            prime.send('live-rendering', lRSwitch.checked);
          };

          lRSwitch.addEventListener('change', lRSwitchUpdater);
          lRSwitchUpdater();
        })();

        delete window['isDev'];
        delete window['settings'];
      };

      zoomViews = window['ready'](window['pyshell'], prime, side, treatResponse, webFrame);

      toggleDisableOnRun(true);

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
  window['saveSettings'](settings['renderer']['input'], 'main');

  ipcRenderer.on('zoom', (_event: IpcRendererEvent, type: string) => {
    if (type == 'in') {
      if (webFrame.getZoomFactor() < 1.8) webFrame.setZoomFactor(webFrame.getZoomFactor() + 0.1);
    } else if (type == 'out') {
      if (webFrame.getZoomFactor() > 0.6) webFrame.setZoomFactor(webFrame.getZoomFactor() - 0.1);
    } else {
      webFrame.setZoomFactor(1);
    }

    zoomViews();
  });

  // add resizabality parts of the UI
  window['border']();
  delete window['border'];

  (() => {
    let main = <HTMLDivElement>document.getElementById('main');

    gaCPBtn.onclick = () => {
      isGACPOpen = true;
      ipcRenderer.send('ga-cp', settings);
      main.classList.toggle('blur', true);
      ipcRenderer.once('ga-cp-finished', (_ev, updatedSettings: object | boolean) => {
        isGACPOpen = false;
        main.classList.toggle('blur', false);
        if (!updatedSettings) return;
        settings['renderer']['input'] = updatedSettings['renderer']['input'];
        saveSettings(settings['renderer']['input'], 'main');
        affectSettings(settings['renderer']['input'], 'main');
        // checks for missing data due to not being loaded by user
        toggleRedDot();
        // send the new attached settings to pyshell
        sendParams();
      });
    };

    /**
     * terminate pyshell process with its threads on close or reload (deprecated)
     */
    window.addEventListener('beforeunload', () => {
      ipcRenderer.send('close-ga-cp');
      main.classList.add('hide');
      window['sendSig']('stop');
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
