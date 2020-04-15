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
 * @param gaConfigPath GA configuration path to check.
 * @param ext extension name, default is ```.py```.
 */
function validatePath(gaConfigPath: string, ext: string = '.py') {
  return existsSync(gaConfigPath)
    ? isAbsolute(gaConfigPath)
      ? statSync(gaConfigPath).isFile()
        ? extname(gaConfigPath).toLowerCase() == ext
          ? 0
          : -4
        : -3
      : -2
    : -1;
}

module.exports = validatePath;
