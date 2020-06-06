import { IpcRenderer, OpenDialogReturnValue } from 'electron';

let ipcRenderer: IpcRenderer = window['ipcRenderer'];
/**
 * revert settings, not updated when inputs change value
 */
let revertSettings: object = window['settings'];
/**
 * current/temp settings, updated when inputs change value, and saves to
 * revertSettings only when user presses save button.
 */
let curSettings: object = JSON.parse(JSON.stringify(window['settings']));
delete window['settings'];
/**
 *
 */
let isClosable = true;
/**
 * checks if path is valid, check conditions are ordered and return value is as follows:
 *
 * - ```-1``` if path does not exist.
 * - ```-2``` if path is not an absolute path.
 * - ```-3``` if path does not point to a file.
 * - ```-4``` if the file extention is not equal to any of the given ```ext```.
 * - ```0``` if path matchs all conditions.
 *
 * @param gaConfigPath GA configuration path to check.
 * @param ext extensions array.
 */
let validatePath: (gaConfigPath: string, ...ext: string[]) => number = window['validatePath'];

let checkPath = (path: string) => {
  let checkCode = validatePath(path, '.json', '.jsonc', '.js');
  switch (checkCode) {
    case -1:
      console.log("path doesn't exist.");
      break;
    case -2:
      console.log('path should be absolute, found relative path.');
      break;
    case -3:
      console.log("the path doesn't point to a file.");
      break;
    case -4:
      console.log('path should point to a JSON file (ends with .json/.jsonc/.js).');
      break;
    default:
      console.log('possible.');
      break;
  }
};

/**
 * browse button
 */
let browseBtn = <HTMLButtonElement>document.getElementById('browse-btn');
/**
 * apply button
 */
let loadBtn = <HTMLButtonElement>document.getElementById('load-btn');
/**
 * input that takes the path to ga configuration
 */
let paramsPath = <HTMLInputElement>document.getElementById('genes-data-path');
/**
 * save button
 */
let saveBtn = <HTMLButtonElement>document.getElementById('save-btn');
/**
 * close button
 */
let closeBtn = <HTMLButtonElement>document.getElementById('close-btn');
/**
 * revert button
 */
let revertBtn = <HTMLButtonElement>document.getElementById('revert-btn');

browseBtn.onclick = () => {
  ipcRenderer.once('browsed-path', (_ev, result: OpenDialogReturnValue) => {
    if (result.canceled) return;
    paramsPath.value = result.filePaths[0];
  });
  ipcRenderer.send('browse');
};

paramsPath.addEventListener('keyup', (ev) => {
  if (ev.key == 'Enter') loadBtn.click()
});

loadBtn.onclick = () => checkPath(paramsPath.value);

(() => {
  /**
   * bottom-right buttons setup
   */
  saveBtn.onclick = () => {
    revertSettings['renderer']['input'] = curSettings['renderer']['input'];
    ipcRenderer.send('ga-cp-finished', curSettings);
  };

  closeBtn.onclick = () => {
    if (isClosable) ipcRenderer.send('ga-cp-finished');
    else ipcRenderer.send('close-confirm');
  };

  revertBtn.onclick = () => {
    revertBtn.disabled = true;
    saveBtn.disabled = true;
    isClosable = true;
    curSettings = revertSettings;
    affectSettings(revertSettings['renderer']['input'], 'ga-cp');
  };

  /**
   * if any input changed value make the window not closable
   * without confirmation, enable revert and save buttons.
   */
  let eventListener = () => (revertBtn.disabled = saveBtn.disabled = isClosable = false);

  Array.from(document.getElementsByTagName('input')).forEach(input => {
    if (input.type == 'checkbox') {
      input.addEventListener('change', eventListener);
    } else if (input.type == 'radio') {
      input.addEventListener('change', eventListener);
    } else {
      input.addEventListener('keypress', eventListener);
      input.addEventListener('paste', eventListener);
      if (!input.id.match('genes-data-path'))
        input.addEventListener('keyup', ev => {
          if (['ArrowUp', 'ArrowDown'].includes(ev.key)) eventListener();
        });
      if (input.classList.contains('textfieldable')) {
        input.addEventListener('change', eventListener);
      }
    }
  });

  (<HTMLButtonElement[]>Array.from(document.getElementsByClassName('random-btn'))).forEach(randomBtn =>
    randomBtn.addEventListener('click', eventListener)
  );
})();

/**
 * add ability for some labels/buttons to be triggered by pressing the altKey
 */
window['altTriggers']();
/**
 * setup params
 */
window['params']();

/**
 * random all button
 */
(<HTMLButtonElement>document.getElementById('random-all-btn')).onclick = () => {
  (<HTMLButtonElement[]>Array.from(document.getElementsByClassName('random-btn'))).forEach(randomBtn => {
    var param = randomBtn.parentElement.parentElement.parentElement;

    if (<HTMLInputElement>param.previousElementSibling && !(<HTMLInputElement>param.previousElementSibling).checked) return;

    randomBtn.click();
  });
};
/**
 * force textfields input that applies to textfieldable inputs
 */
document.getElementById('force-tf-enabled').addEventListener('change', ev => {
  Array.from(document.getElementsByClassName('textfieldable')).forEach((textfieldable: HTMLInputElement) => {
    textfieldable.type = (<HTMLInputElement>ev.target).checked ? 'text' : 'range';
  });
});

let toggleDisableOnRun = (disable: boolean) => {
  (<HTMLInputElement[]>(
    (<HTMLDivElement[]>Array.from(document.getElementsByClassName('param-value'))).map(paramValue => paramValue.firstElementChild)
  )).forEach(gaParam => {
    if (!gaParam.classList.contains('disable-on-run')) return;
    curSettings['renderer']['input'][gaParam.id]['disable'] = disable;
    gaParam.disabled = disable;
    (<HTMLButtonElement>gaParam.parentElement.nextElementSibling.firstElementChild).disabled = disable;
    gaParam.parentElement.parentElement.title = !disable ? '' : 'Disabled when GA is Running';
  });

  let gaTypes = (<HTMLDivElement[]>Array.from(document.getElementsByClassName('type-value')))
    .reduce((accum: Element[], typeValue) => accum.concat(...Array.from(typeValue.children)), [])
    .map((label: HTMLLabelElement) => <HTMLInputElement>label.firstElementChild)
    .filter(radioInput => radioInput.name != 'update_pop');
  curSettings['renderer']['input'][gaTypes[0].name.replace('_', '-')]['disable'] = disable;
  gaTypes.forEach(gaType => {
    gaType.disabled = disable;
    gaType.parentElement.parentElement.title = disable ? 'Disabled when GA is Running' : '';
  });
};

ipcRenderer.on('update-settings', (_ev, activate: boolean) => {
  toggleDisableOnRun(!activate);
});
/**
 * if user tries to close window using the top bar close button, window has to
 * assure that the window is closable (no input has changed value), if closable
 * it closes immediately, else it shows confirmation dialog.
 */
ipcRenderer.on('close-confirm', () => {
  if (isClosable) ipcRenderer.send('ga-cp-finished');
  else ipcRenderer.send('close-confirm');
});

/**
 * affects settings to inputs
 */
window['affectSettings'](curSettings['renderer']['input'], 'ga-cp');
/**
 * add functionality to update settings onchange event for inputs
 */
window['saveSettings'](curSettings['renderer']['input']);
// apply one of the .disable-on-run to be
toggleDisableOnRun(curSettings['renderer']['input']['pop-size']['disable']);

window['border']();
