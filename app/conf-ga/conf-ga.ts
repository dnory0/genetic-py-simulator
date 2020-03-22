import { IpcRenderer, OpenDialogReturnValue } from 'electron';

let ipcRenderer: IpcRenderer = window['ipcRenderer'];

/**
 * checks if path is valid, check conditions are ordered and return value is as follows:
 *
 * - ```-1``` if path does not exist.
 * - ```-2``` if path is not an absolute path.
 * - ```-3``` if path does not point to a file.
 * - ```-4``` if the file extention is not equal to the given ```ext```.
 * - ```0``` if path matchs all conditions.
 *
 * @param confGAPath GA configuration path to check.
 * @param ext extension name, default is ```.py```.
 */
let validatePath: (confGAPath: string, ext?: string) => number =
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
let ffPath = <HTMLInputElement>document.getElementById('ff-path');

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
    ffPath.value = result.filePaths[0];
    checkPath(result.filePaths[0]);
  });
  ipcRenderer.send('browse');
};

ffPath.onkeypress = () => checkPath(ffPath.value);

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

window.onkeydown = (ev: KeyboardEvent) => {
  if (ev.key == 'Alt') {
    Array.from(document.getElementsByClassName('alt-trigger')).forEach(
      (altTrigger: HTMLSpanElement) => {
        if (!(<HTMLButtonElement>altTrigger.parentElement).disabled)
          altTrigger.style.textDecoration = 'underline';
      }
    );
  } else if (ev.altKey) {
    switch (ev.key) {
      case 's':
        if (!saveBtn.disabled) saveBtn.classList.add('hover');
        break;
      case 'c':
        if (!cancelBtn.disabled) cancelBtn.classList.add('hover');
        break;
      case 'r':
        if (!revertBtn.disabled) revertBtn.classList.add('hover');
        break;
    }
  }
};

(() => {
  function altTriggered(button: HTMLButtonElement) {
    if (!button.disabled) {
      button.classList.remove('hover');
      button.click();
    }
  }

  window.onkeyup = (ev: KeyboardEvent) => {
    if (ev.key == 'Alt') {
      Array.from(document.getElementsByClassName('alt-trigger')).forEach(
        (altTrigger: HTMLSpanElement) => {
          if (!(<HTMLButtonElement>altTrigger.parentElement).disabled)
            altTrigger.style.textDecoration = 'none';
        }
      );
    } else if (ev.altKey) {
      switch (ev.key) {
        case 's':
          altTriggered(saveBtn);
          break;
        case 'c':
          altTriggered(cancelBtn);
          break;
        case 'r':
          altTriggered(revertBtn);
          break;
      }
    }
  };
})();
