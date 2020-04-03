import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  Rectangle,
  dialog,
  OpenDialogOptions,
  OpenDialogReturnValue
} from 'electron';
import { join } from 'path';
import { writeFile } from 'fs';
import { ChildProcess } from 'child_process';

/**
 * set to true if app on development, false in production.
 */
const isDev = process.argv.some(arg => ['--dev', '-D', '-d'].includes(arg));
global['isDev'] = isDev;
/**
 * main window
 */
let mainWindow: BrowserWindow;
/**
 * GA Configuration Window
 */
let gaWindow: BrowserWindow;
/**
 * python process responsible for executing genetic algorithm.
 */
const pyshell: ChildProcess = require(join(
  __dirname,
  'modules',
  'create-pyshell.js'
))(app);
global['pyshell'] = pyshell;
/**
 * load settings
 */
let runSettings: object = require(join(
  __dirname,
  'modules',
  'load-settings.js'
))(
  join(app.getPath('userData'), 'settings.json'),
  join(__dirname, '..', 'settings.json')
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

/**
 * opens dialog to browse for a specific file
 *
 * @param window parent window of the dialog.
 * @param options dialog options.
 * @param resolved function to be executed when dialog resolves.
 * @param rejected function to be executed when dialog rejectes, usually when browse is canceled.
 */
const browse = (
  window: BrowserWindow,
  options: OpenDialogOptions,
  resolved: (path: OpenDialogReturnValue) => any,
  rejected: (reason: any) => any
) => {
  dialog
    .showOpenDialog(window, options)
    .then(resolved)
    .catch(rejected);
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

  mainWindow.webContents.on('ipc-message', (_ev, channel, args) => {
    let confirmClose = () => {
      return dialog.showMessageBox(gaWindow, {
        type: 'question',
        title: 'Are you sure?',
        message: 'You have unsaved changes, are you sure you want to close?',
        cancelId: 0,
        defaultId: 1,
        buttons: ['Ca&ncel', '&Confirm'],
        normalizeAccessKeys: true
      });
    };

    if (channel == 'ga-cp') {
      gaWindow = createWindow(join(__dirname, 'ga-cp', 'ga-cp.html'), {
        minWidth: 680,
        minHeight: 480,
        parent: mainWindow,
        webPreferences: {
          preload: join(__dirname, 'preloads', 'ga-cp-preload.js')
        }
      });

      gaWindow.once('ready-to-show', gaWindow.show);

      if (!isDev) gaWindow.removeMenu();

      gaWindow.webContents.on(
        'ipc-message',
        (_ev, gaChannel, gaCPConfig: object) => {
          if (gaChannel == 'ga-cp-finished') {
            mainWindow.webContents.send('ga-cp-finished', gaCPConfig);
            gaWindow.destroy();
          } else if (gaChannel == 'close-confirm') {
            (async () => {
              await confirmClose()
                .then(result => {
                  if (result.response) {
                    mainWindow.webContents.send('ga-cp-finished', gaCPConfig);
                    gaWindow.destroy();
                  }
                })
                .catch(reason => {
                  if (reason) throw reason;
                });
            })();
          } else if (gaChannel == 'browse') {
            browse(
              gaWindow,
              {
                title: 'Open GA Configuration file',
                // TODO: read from runSettings
                defaultPath: app.getPath('desktop'),
                filters: [
                  {
                    name: 'Python File (.py)',
                    extensions: ['py']
                  }
                ],
                properties: ['openFile']
              },
              result => gaWindow.webContents.send('browsed-path', result),
              reason => {
                gaWindow.webContents.send('browsed-path', { canceled: true });
                if (reason) throw reason;
              }
            );
          } else if (gaChannel == 'settings') {
            gaWindow.webContents.send('settings', args);
          }
        }
      );
      gaWindow.on('close', ev => {
        ev.preventDefault();
        gaWindow.webContents.send('close-confirm');
      });
    } else if (channel == '') {
      if (gaWindow && !gaWindow.isDestroyed()) gaWindow.close();
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
    mainWindow.webContents.send('settings');
    mainWindow.webContents.once(
      'ipc-message',
      (_ev, channel, settings: object) => {
        if (channel != 'settings') return;
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

app.once('will-quit', () => pyshell.stdin.write('exit\n'));
