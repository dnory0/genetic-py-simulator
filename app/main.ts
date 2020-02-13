import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  Rectangle
} from 'electron';
import { join } from 'path';
import { writeFile } from 'fs';

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
 * loads app settings
 *
 * @param fn callback function to execute after reading settings.json file
 */
require(join(__dirname, 'modules', 'load-settings.js'))(
  join(app.getPath('userData'), 'settings.json'),
  join(__dirname, '..', 'settings.json'),
  (settings: object) => (runSettings = settings)
);

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
  (<any>process.env['ELECTRON_DISABLE_SECURITY_WARNINGS']) = true;

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

  (() => {
    let readyToShow = () => {
      mainWindow.setSize(
        runSettings['app']['width'] ? runSettings['app']['width'] : 720,
        runSettings['app']['height'] ? runSettings['app']['height'] : 500
      );
      if (runSettings['app']['x'] && runSettings['app']['y'])
        mainWindow.setBounds({
          x: runSettings['app']['x'] ? runSettings['app']['x'] : -200,
          y: runSettings['app']['y'] ? runSettings['app']['y'] : -200
        } as Rectangle);

      mainWindow.setFullScreen(runSettings['app']['fscreen'] ? true : false);
      if (runSettings['app']['maximized']) mainWindow.maximize();

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

  mainWindow.on('close', () => {
    mainWindow.webContents.send('cur-settings');
    mainWindow.webContents.once(
      'ipc-message',
      (_ev, channel, settings: object) => {
        if (channel != 'cur-settings') return;
        settings['app']['fscreen'] = mainWindow.isFullScreen();
        settings['app']['maximized'] = mainWindow.isMaximized();
        settings['app']['width'] = mainWindow.getSize()[0];
        settings['app']['height'] = mainWindow.getSize()[1];
        if (mainWindow.getBounds().x && mainWindow.getBounds().y) {
          settings['app']['x'] = mainWindow.getBounds().x;
          settings['app']['y'] = mainWindow.getBounds().y;
        }
        writeFile(
          join(app.getPath('userData'), 'settings.json'),
          JSON.stringify(settings),
          err => {
            if (err) throw err;
          }
        );
      }
    );
  });
});

// mkdir(
//   isDev
//     ? join(__dirname, '..', 'libs')
//     : join(__dirname, '..', '..', '..', 'libs'),
//   (error: NodeJS.ErrnoException) => {
//     if (error && error.errno != -17) throw error;
//   }
// );
