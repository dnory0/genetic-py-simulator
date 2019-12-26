import { exec } from 'child_process';
import { join } from 'path';

const distPython = exec(
  `pyinstaller --onefile --specpath ${join(
    'app',
    'python',
    'spec',
    process.platform == 'linux' ? 'linux' : 'win'
  )} --distpath ${join(
    'app',
    'python',
    'dist',
    process.platform == 'linux' ? 'linux' : 'win'
  )} --workpath ${join(
    'app',
    'python',
    'build',
    process.platform == 'linux' ? 'linux' : 'win'
  )} ${join('app', 'python', 'ga.py')}`
);
distPython.stdout.pipe(process.stdout);
distPython.stderr.pipe(process.stderr);
