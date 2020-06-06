import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  Rectangle,
  dialog,
  OpenDialogOptions,
  OpenDialogReturnValue,
} from 'electron';
import { join } from 'path';
import { writeFileSync } from 'fs';
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
const pyshell: ChildProcess = require(join(__dirname, 'modules', 'create-pyshell.js'))(app);
global['pyshell'] = pyshell;
/**
 * load settings
 */
let settings: object = require(join(__dirname, 'modules', 'load-settings.js'))(app, process.argv.some(arg => ['--reset-settings', '-S'].includes(arg)));
global['settings'] = settings;

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
    webPreferences: { preload, webviewTag },
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
    icon: join(app.getAppPath(), '..', 'build', 'icons', process.platform == 'win32' ? 'icon.ico' : 'icon.icns'),
    parent,
    frame,
    modal: true,
    show: false,
    webPreferences: {
      preload,
      webviewTag,
    },
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
  dialog.showOpenDialog(window, options).then(resolved).catch(rejected);
};

app.once('ready', () => {
  (<any>process.env['ELECTRON_DISABLE_SECURITY_WARNINGS']) = true;

  // creates main window
  mainWindow = createWindow(join(__dirname, 'index.html'), {
    minWidth: 720,
    minHeight: 500,
    webPreferences: {
      preload: join(__dirname, 'preloads', 'preload.js'),
      webviewTag: true,
    },
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
  mainWindow.setMenu(require(join(__dirname, 'modules', 'menubar.js'))(isDev, mainWindow));

  mainWindow.webContents.on('ipc-message', (_ev, channel, args) => {
    if (channel == 'ga-cp') {
      if (gaWindow && !gaWindow.isDestroyed()) {
        gaWindow.webContents.send('update-settings', args);
        return;
      }
      gaWindow = createWindow(join(__dirname, 'ga-cp', 'ga-cp.html'), {
        minWidth: 680,
        minHeight: 480,
        maximizable: false,
        minimizable: false,
        parent: mainWindow,
        webPreferences: {
          preload: join(__dirname, 'preloads', 'ga-cp-preload.js'),
        },
      });

      gaWindow.once('ready-to-show', gaWindow.show);

      if (!isDev) gaWindow.removeMenu();

      gaWindow.webContents.on('ipc-message', (_ev, gaChannel, updatedSettings: boolean) => {
        if (gaChannel == 'ga-cp-finished') {
          mainWindow.webContents.send('ga-cp-finished', updatedSettings);
          gaWindow.destroy();
        } else if (gaChannel == 'close-confirm') {
          (async () => {
            await (() => {
              return dialog.showMessageBox(gaWindow, {
                type: 'warning',
                title: 'Are you sure?',
                message: 'You have unsaved changes, are you sure you want to close?',
                cancelId: 0,
                defaultId: 1,
                buttons: ['Ca&ncel', '&Confirm'],
                normalizeAccessKeys: true,
              });
            })()
              .then(result => {
                if (!result.response) return;
                mainWindow.webContents.send('ga-cp-finished', updatedSettings);
                gaWindow.destroy();
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
                  name: 'JSON File (.json)',
                  extensions: ['json', 'jsonc', 'js'],
                },
              ],
              properties: ['openFile'],
            },
            result => gaWindow.webContents.send('browsed-path', result),
            reason => {
              gaWindow.webContents.send('browsed-path', { canceled: true });
              if (reason) throw reason;
            }
          );
        }
      });
      gaWindow.on('close', ev => {
        ev.preventDefault();
        gaWindow.webContents.send('close-confirm');
      });
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.setSize(settings['main']['width'], settings['main']['height']);

    if (settings['main']['x'] && settings['main']['y']) {
      mainWindow.setBounds({
        x: settings['main']['x'],
        y: settings['main']['y'],
      } as Rectangle);
    }

    if (settings['main']['maximized']) mainWindow.maximize();

    mainWindow.setFullScreen(settings['main']['fscreen'] ? true : false);

    mainWindow.show();
  });

  mainWindow.on('close', () => {
    settings['main']['fscreen'] = mainWindow.isFullScreen();
    settings['main']['maximized'] = mainWindow.isMaximized();

    if (mainWindow.getNormalBounds().x > 0 && mainWindow.getNormalBounds().y > 0) {
      settings['main']['width'] = mainWindow.getNormalBounds().width;
      settings['main']['height'] = mainWindow.getNormalBounds().height;
      settings['main']['x'] = mainWindow.getNormalBounds().x;
      settings['main']['y'] = mainWindow.getNormalBounds().y;
    }

    writeFileSync(
      join(app.isPackaged ? app.getPath('userData') : join(app.getAppPath(), '..'), 'settings.json'),
      JSON.stringify(settings)
    );
  });
});

app.once('will-quit', () => pyshell.stdin.write('exit\n'));
