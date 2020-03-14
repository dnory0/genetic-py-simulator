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

/**
 * browse button
 */
let browseBtn = <HTMLButtonElement>document.getElementById('browse-btn');
/**
 * input that takes the path to ga configuration
 */
let ffPath = <HTMLInputElement>document.getElementById('ff-path');

browseBtn.onclick = () => {
  ipcRenderer.once('browsed-path', (_ev, result: OpenDialogReturnValue) => {
    if (result.canceled) return;
    ffPath.value = result.filePaths[0];
    checkPath(result.filePaths[0]);
  });
  ipcRenderer.send('browse');
};

ffPath.onkeydown = () => checkPath(ffPath.value);

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
