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
    modal: true,
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
    mainWindow.autoHideMenuBar = true;
    mainWindow.setMenuBarVisibility(false);
  });

  // disable autohide on menubar on fullscreen
  mainWindow.on('leave-full-screen', () => {
    mainWindow.setMenuBarVisibility(true);
    mainWindow.autoHideMenuBar = false;
  });

  /**
   * sets menu and free module after it's done
   */
  mainWindow.setMenu(
    require(join(__dirname, 'modules', 'menubar.js'))(isDev, mainWindow)
  );

  mainWindow.webContents.on('ipc-message', (_ev, channel) => {
    if (channel == 'mode') mainWindow.webContents.send('mode', isDev);
    else if (channel == 'conf-ga') {
      const gaWindow = createWindow(
        join(__dirname, 'conf-ga', 'conf-ga.html'),
        {
          parent: mainWindow,
          webPreferences: {
            preload: null,
            webviewTag: false
          }
        }
      );

      gaWindow.once('ready-to-show', gaWindow.show);

      gaWindow.removeMenu();

      gaWindow.once('closed', _ev => {
        if (channel == 'conf-ga')
          mainWindow.webContents.send('conf-ga', { test: true });
      });
      // gaWindow.webContents.once(
      //   'ipc-message',
      //   (_ev, channel, gaconf: String) => {
      //     if (channel == 'conf-ga')
      //       mainWindow.webContents.send('conf-ga', gaconf);
      //   }
      // );
    }
  });

  (() => {
    let readyToShow = () => {
      mainWindow.setSize(
        runSettings['main']['width'] ? runSettings['main']['width'] : 720,
        runSettings['main']['height'] ? runSettings['main']['height'] : 500
      );
      if (runSettings['main']['x'] && runSettings['main']['y'])
        mainWindow.setBounds({
          x: runSettings['main']['x'] ? runSettings['main']['x'] : -200,
          y: runSettings['main']['y'] ? runSettings['main']['y'] : -200
        } as Rectangle);

      mainWindow.setFullScreen(runSettings['main']['fscreen'] ? true : false);
      if (runSettings['main']['maximized']) mainWindow.maximize();

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
        settings['main']['fscreen'] = mainWindow.isFullScreen();
        settings['main']['maximized'] = mainWindow.isMaximized();
        settings['main']['width'] = mainWindow.getSize()[0];
        settings['main']['height'] = mainWindow.getSize()[1];
        if (mainWindow.getBounds().x && mainWindow.getBounds().y) {
          settings['main']['x'] = mainWindow.getBounds().x;
          settings['main']['y'] = mainWindow.getBounds().y;
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
