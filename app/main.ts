import { app, BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import { join } from 'path';

/**
 * set to true if app on development, false in production.
 */
const isDev = process.argv.some(arg => ['--dev', '-D', '-d'].includes(arg));
/**
 * main window
 */
let mainWindow: BrowserWindow;
/**
 * declared and initialized globally
 */
// let pyshell: ChildProcess;
/**
 * @param filePath  string path to an HTML file relative to the root of your application
 * @param options   constructor options for the browser window returned
 */
const createWindow = (
  filePath: string,
  {
    minWidth,
    minHeight,
    width,
    height,
    resizable,
    minimizable,
    maximizable,
    parent,
    frame,
    webPreferences: { preload, webviewTag }
  }: BrowserWindowConstructorOptions = {}
): BrowserWindow => {
  let targetWindow = new BrowserWindow({
    minWidth,
    minHeight,
    width,
    height,
    resizable,
    minimizable,
    maximizable,
    parent,
    frame,
    show: false,
    webPreferences: {
      preload,
      webviewTag
    }
  });

  targetWindow.loadFile(filePath);

  targetWindow.once('ready-to-show', targetWindow.show);

  targetWindow.once('closed', () => {
    /**
     * free targetWindow
     */
    targetWindow = null;
  });
  return targetWindow;
};

app.once('ready', () => {
  if (isDev) (<any>process.env['ELECTRON_DISABLE_SECURITY_WARNINGS']) = true;

  // creates main window
  mainWindow = createWindow(join(__dirname, 'index.html'), {
    minWidth: 720,
    minHeight: 500,
    webPreferences: {
      preload: join(__dirname, 'preloads', 'preload.js'),
      webviewTag: true
    }
  });

  // enable autohide on menubar on fullscreen
  mainWindow.on('enter-full-screen', () => {
    mainWindow.setAutoHideMenuBar(true);
    mainWindow.setMenuBarVisibility(false);
  });

  // disable autohide on menubar on fullscreen
  mainWindow.on('leave-full-screen', () => {
    mainWindow.setMenuBarVisibility(true);
    mainWindow.setAutoHideMenuBar(false);
  });

  /**
   * sets menu and free module after it's done
   */
  app.applicationMenu = require(join(__dirname, 'modules', 'menubar.js'))(
    isDev,
    mainWindow
  );

  mainWindow.webContents.on('ipc-message', (_ev, channel) => {
    if (channel == 'mode') mainWindow.webContents.send('mode', isDev);
  });
});

// writeFile(
//   join(__dirname, '..', 'settings.json'),
//   'test content 🚀🚀🚀🚀',
//   (error: NodeJS.ErrnoException) => {
//     if (error) throw error;
//   }
// );

// mkdir(
//   isDev
//     ? join(__dirname, '..', 'libs')
//     : join(__dirname, '..', '..', '..', 'libs'),
//   (error: NodeJS.ErrnoException) => {
//     if (error && error.errno != -17) throw error;
//   }
// );
