import { exec } from 'child_process';
import { join } from 'path';

const appDir = join(__dirname, '..');

if (process.platform == 'linux')
  exec(' ps -e | grep genetic-py', (_err, output) => {
    if (!output) return;
    output
      .split(/(?<=\n\r?)/)
      .map((process: string) => process.match(/[0-9]{1,5}/))
      .forEach(pid => setTimeout(() => exec(`kill ${pid.toLocaleString()}`)));
  }).stderr.pipe(process.stderr);
exec(`rm ${join(appDir, 'dist')} -r`).stderr.pipe(process.stderr);
