import { app, BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import { join } from 'path';

/**
 * set to true if app on development, false in production.
 *
 * NOTE: app needs to be packed on asar (by default) to detect production mode
 * if you don't set asar to false on electron-builder.json you're good to go
 */
const isDev = app.getAppPath().indexOf('.asar') === -1;
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
    webPreferences: { preload, nodeIntegration, webviewTag }
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
      nodeIntegration,
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
  mainWindow = createWindow(join('app', 'index.html'), {
    minWidth: 580,
    minHeight: 430,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
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
  app.applicationMenu = require('./menubar')(isDev, mainWindow);
  delete require.cache[require.resolve('./menubar')];
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
