import { IpcRenderer, OpenDialogReturnValue } from 'electron';

let ipcRenderer: IpcRenderer = window['ipcRenderer'];
/**
 * checks if path is valid, check conditions are ordered and return value is as follows:
 *
 * - ```-1``` if path does not exist.
 * - ```-2``` if path is not an absolute path.
 * - ```-3``` if path does not point to a file.
 * - ```-4``` if the file extention is not ```.py```.
 * - ```0``` if path matchs all conditions.
 *
 * @param confGAPath GA configuration path to check
 */
let isValidPath: (confGAPath: string) => number = window['isValidPath'];

/**
 * browse button
 */
let browseBtn = <HTMLButtonElement>document.getElementById('browse-btn');
/**
 * input that takes the path to ga configuration
 */
let ffPath = <HTMLInputElement>document.getElementById('ff-path');

browseBtn.onclick = () => {
  ipcRenderer.send('browse');
  console.log('browse');
};

ffPath.onkeyup = () => checkPath(ffPath.value);
// ffPath.onkeyup = () => console.log(ffPath.value);

let checkPath = (path: string) => {
  let checkCode = isValidPath(path);
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
      ffPath.value = '/home/dnory0/Desktop/lists.py';
      break;
  }
};

ipcRenderer.on('browsed-path', (_ev, result: OpenDialogReturnValue) => {
  if (result.canceled) return;
  checkPath(result.filePaths[0]);
});
