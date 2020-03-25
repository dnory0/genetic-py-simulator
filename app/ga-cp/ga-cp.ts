import { IpcRenderer, OpenDialogReturnValue } from 'electron';

let ipcRenderer: IpcRenderer = window['ipcRenderer'];
/**
 * current settings
 */
let settings: object;
/**
 * checks if path is valid, check conditions are ordered and return value is as follows:
 *
 * - ```-1``` if path does not exist.
 * - ```-2``` if path is not an absolute path.
 * - ```-3``` if path does not point to a file.
 * - ```-4``` if the file extention is not equal to the given ```ext```.
 * - ```0``` if path matchs all conditions.
 *
 * @param gaConfigPath GA configuration path to check.
 * @param ext extension name, default is ```.py```.
 */
let validatePath: (gaConfigPath: string, ext?: string) => number =
  window['validatePath'];

let checkPath = (path: string) => {
  let checkCode = validatePath(path);
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
      console.log('path should point to a python file (ends with .py).');
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
 * input that takes the path to ga configuration
 */
let paramsPath = <HTMLInputElement>document.getElementById('params-path');

/**
 * save button
 */
let saveBtn = <HTMLButtonElement>document.getElementById('save-btn');
/**
 * cancel button
 */
let cancelBtn = <HTMLButtonElement>document.getElementById('cancel-btn');
/**
 * revert button
 */
let revertBtn = <HTMLButtonElement>document.getElementById('revert-btn');

browseBtn.onclick = () => {
  ipcRenderer.once('browsed-path', (_ev, result: OpenDialogReturnValue) => {
    if (result.canceled) return;
    paramsPath.value = result.filePaths[0];
    checkPath(result.filePaths[0]);
  });
  ipcRenderer.send('browse');
};

paramsPath.onkeypress = () => checkPath(paramsPath.value);

(() => {
  function saveConfig() {
    // TODO:
    console.log('save triggered');
  }

  saveBtn.onclick = () => {
    saveConfig();
  };
})();

cancelBtn.onclick = () => {
  console.log('cancel triggered');
};

revertBtn.onclick = () => {
  console.log('revert triggered');
};

/**
 * add ability for some labels/buttons to be triggered by pressing the altKey
 */
window['altTriggers']();
/**
 * setup params
 */
window['params']();

(<HTMLButtonElement>document.getElementById('random-all-btn')).onclick = () => {
  (<HTMLButtonElement[]>(
    Array.from(document.getElementsByClassName('random-btn'))
  )).forEach(randomBtn => {
    var param = randomBtn.parentElement.parentElement.parentElement;
    if (
      param.parentElement.classList.contains('complex-param') &&
      !(<HTMLInputElement>param.previousElementSibling).checked
    )
      return;

    randomBtn.click();
  });
};

document.getElementById('force-textfields').addEventListener('change', ev => {
  Array.from(document.getElementsByClassName('textfieldable')).forEach(
    (textfieldable: HTMLInputElement) => {
      textfieldable.type = (<HTMLInputElement>ev.target).checked
        ? 'text'
        : 'range';
    }
  );
});

ipcRenderer.once('settings', (_ev, args) => {
  settings = args;
  window['affectSettings'](settings['renderer']['input']);
  /**
   * add functionality to update settings onchange event for inputs
   */
  window['saveSettings'](settings['renderer']['input']);
});

ipcRenderer.send('settings');
