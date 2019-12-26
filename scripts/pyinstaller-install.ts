import { exec } from 'child_process';

const distPython = exec(
  `${
    process.platform == 'linux' ? 'python3' : 'python'
  } -m pip install pyinstaller --user`
);
distPython.stdout.pipe(process.stdout);
distPython.stderr.pipe(process.stderr);
