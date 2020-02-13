// import { compileFile } from 'bytenode';
// import { setFlagsFromString } from 'v8';
import { join } from 'path';
import { exec } from 'child_process';

// setFlagsFromString('--no-lazy');

const appDir = join(__dirname, '..');
exec(
  `dir ${join(appDir, 'main', '*.js')} ${join(appDir, 'main', '**', '*.js')}`,
  (_error, output) => {
    // var files = output
    //   .split(/\n\r?/)
    //   .filter(
    //     file =>
    //       !file.match(
    //         /preload|renderer|launch|prime-chart|side-chart|^$/
    //       )
    //   );
    // files.forEach(file => exec(`rm ${file}c`).stderr.pipe(process.stderr));
    // files.forEach(file => compileFile(file));
    // files.forEach(file => console.log(file));
    const elecBuilder = exec(
      `${join(appDir, 'node_modules', '.bin', 'electron-builder')} ${
        process.platform == 'linux'
          ? '-l'
          : process.platform == 'darwin'
          ? '-m'
          : '-w'
      } --x64`
      // () =>
      // files.forEach(file => exec(`rm ${file}c`).stderr.pipe(process.stderr))
      // files.forEach(file => console.log(`rm ${file}c`))
    );
    elecBuilder.stdout.pipe(process.stdout);
    elecBuilder.stderr.pipe(process.stderr);
  }
).stderr.pipe(process.stderr);
