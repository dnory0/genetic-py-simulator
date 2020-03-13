import { existsSync, statSync } from 'fs';
import { isAbsolute, extname } from 'path';
import { ipcRenderer } from 'electron';

window['ipcRenderer'] = ipcRenderer;

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
let isValidPath = (confGAPath: string) =>
  existsSync(confGAPath)
    ? isAbsolute(confGAPath)
      ? statSync(confGAPath).isFile()
        ? extname(confGAPath) == '.py'
          ? 0
          : -4
        : -3
      : -2
    : -1;

window['isValidPath'] = isValidPath;
