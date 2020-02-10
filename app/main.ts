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
 * settings
 */
let runSettings: object;
/**
 * on first loading is false, after reloading is set to true
 */
let reloaded = false;
/**
 * loads app settings
 *
 * @param fn callback function to execute after reading settings.json file
 */
let loadSettings = (fn: (settings: object) => void) =>
  require(join(__dirname, 'modules', 'load-settings.js'))(app, fn);

loadSettings((settings: object) => (runSettings = settings));

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
    mainWindow,
    () => (reloaded = true)
  );

  mainWindow.webContents.on('ipc-message', (_ev, channel) => {
    if (channel == 'mode') mainWindow.webContents.send('mode', isDev);
    else if (channel == 'settings' && reloaded)
      loadSettings(settings => {
        runSettings = settings;
        mainWindow.webContents.send('settings', settings);
      });
  });

  (() => {
    let readyToShow = () => {
      mainWindow.webContents.send('settings', runSettings);
      mainWindow.setSize(
        runSettings['app']['width'],
        runSettings['app']['height']
      );

      mainWindow.show();
    };

    mainWindow.once('ready-to-show', () => {
      if (runSettings) readyToShow();
      else {
        let settingsTimer = setInterval(() => {
          if (!runSettings) return;
          clearInterval(settingsTimer);
          readyToShow();
        }, 100);
      }
    });
  })();
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
