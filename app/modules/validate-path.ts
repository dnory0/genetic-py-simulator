import { existsSync, statSync } from 'fs';
import { isAbsolute, extname } from 'path';

/**
 * checks if given path is valid, check conditions are ordered and return value is as follows:
 *
 * - ```-1``` if path does not exist.
 * - ```-2``` if path is not an absolute path.
 * - ```-3``` if path does not point to a file.
 * - ```-4``` if the file extention is not equal to any of the given ```ext```.
 * - ```0``` if path matchs all conditions.
 *
 * @param filePath file path to check & validate.
 * @param exts extensions array.
 */
function validatePath(filePath: string, ...exts: string[]) {
  return existsSync(filePath)
    ? isAbsolute(filePath)
      ? statSync(filePath).isFile()
        ? exts.includes(extname(filePath).toLowerCase())
          ? 0
          : -4
        : -3
      : -2
    : -1;
}

module.exports = validatePath;
