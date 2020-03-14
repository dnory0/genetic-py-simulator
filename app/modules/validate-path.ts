import { existsSync, statSync } from 'fs';
import { isAbsolute, extname } from 'path';

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
let validatePath = (confGAPath: string, ext: string = '.py') =>
  existsSync(confGAPath)
    ? isAbsolute(confGAPath)
      ? statSync(confGAPath).isFile()
        ? extname(confGAPath).toLowerCase() == ext
          ? 0
          : -4
        : -3
      : -2
    : -1;

module.exports = validatePath;
