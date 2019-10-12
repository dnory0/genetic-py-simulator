import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  Menu,
  MenuItem,
  BrowserView,
  BrowserViewConstructorOptions,
  Rectangle,
  ipcMain,
  IpcMainEvent
} from 'electron';
import { join } from 'path';
import { existsSync, copyFileSync } from 'fs';
import { spawn, ChildProcess } from 'child_process';

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
 * primary Chart View (as progress Chart)
 */
let primaryView: BrowserView;
/**
 * most secondary Chart View (working on making it either most fittest/current fittest)
 */
let secondaryView: BrowserView;

/**
 * declared and initialized globally
 */
let pyshell: ChildProcess;
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
    webPreferences: { nodeIntegration, preload }
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
      nodeIntegration,
      preload
    }
  });

  targetWindow.loadFile(filePath);

  targetWindow.once('ready-to-show', targetWindow.show);

  targetWindow.on('close', () => {
    /**
     * exit the GA and kill spawned process, usually called on exit or reload app.
     */
    pyshell.stdin.write(`${JSON.stringify({ exit: true })}\n`);
  });

  targetWindow.once('closed', () => {
    targetWindow = null;
    primaryView.destroy();
    secondaryView.destroy();
  });
  return targetWindow;
};

/**
 * resizes browser view
 * @param targetView browser view to resize
 * @param bounds by default x & y are set to 0, width & height are set to mainWindow width & hight
 */
const resizeView = (
  targetView: BrowserView,
  {
    /**
     * x of target view according to parent window
     */
    x = 0,
    /**
     * y of target view according to parent window
     */
    y = 0,
    /**
     * width of target view
     */
    width = mainWindow.getBounds().width,
    /**
     * height of target view
     */
    height = mainWindow.getBounds().height
  } = {}
) => {
  targetView.setBounds({
    x,
    y,
    width,
    height
  } as Rectangle);
};

/**
 * @param parentWindow  parent window of the returned view
 * @param filePath      string path to an HTML file relative to the root of your application
 * @param options       constructor options for the browser view returned
 */
const createView = (
  parentWindow: BrowserWindow,
  filePath: string,
  {
    webPreferences: { preload, nodeIntegration }
  }: BrowserViewConstructorOptions = {}
) => {
  /**
   * view created with default preload and nodeIntegration
   */
  let targetView = new BrowserView({
    webPreferences: {
      preload,
      nodeIntegration
    }
  });

  // load file
  targetView.webContents.loadFile(filePath);

  // add to parent window
  parentWindow.addBrowserView(targetView);

  return targetView;
};

/**
 * initialize pyshell depending on the mode (development/production) and
 * platform (win32/linux)
 */
const createPyshell = () => {
  // if in development
  if (isDev) {
    // works with the script version
    pyshell = spawn(`${process.platform == 'win32' ? 'python' : 'python3'}`, [
      join(__dirname, 'python', 'ga.py')
    ]);
  } else {
    /**
     * path of executable/script to copy
     */
    let copyFrom: string;
    /**
     * temp directory which the executable/script is going to be copied to
     */
    let copyTo: string;
    /**
     * set to true if executable is available
     */
    let execExist = existsSync(
      join(
        __dirname,
        'python',
        'dist',
        process.platform == 'win32'
          ? join('win', 'ga.exe')
          : join('linux', 'ga')
      )
    );

    if (execExist) {
      copyFrom = join(
        __dirname,
        'python',
        'dist',
        process.platform == 'win32'
          ? join('win', 'ga.exe')
          : join('linux', 'ga')
      );
      copyTo = join(
        app.getPath('temp'),
        process.platform == 'win32' ? 'ga.exe' : 'ga'
      );
    } else {
      copyFrom = join(__dirname, 'python', 'ga.py');
      copyTo = join(app.getPath('temp'), 'ga.py');
    }
    // works with the executable version
    copyFileSync(copyFrom, copyTo);
    pyshell = spawn(
      execExist
        ? copyTo
        : `${process.platform == 'win32' ? 'python' : 'python3'}`,
      execExist ? [] : [copyTo]
    );
  }
  module.exports = pyshell;
};

app.once('ready', () => {
  ipcMain.once('views-ready', (_event: IpcMainEvent) => {
    mainWindow.webContents.send('views-ready');
  });
  /****************************** Pyshell part *****************************
   *************************************************************************/
  createPyshell();
  /****************************** Main Window ******************************
   *************************************************************************/
  mainWindow = createWindow(join('app', 'index.html'), {
    minWidth: 580,
    minHeight: 430,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false
    }
  });

  mainWindow.on('enter-full-screen', () => {
    mainWindow.setAutoHideMenuBar(true);
    mainWindow.setMenuBarVisibility(false);
  });

  mainWindow.on('leave-full-screen', () => {
    mainWindow.setMenuBarVisibility(true);
    mainWindow.setAutoHideMenuBar(false);
  });

  /***************************** Browser Views *****************************
   *************************************************************************/

  /***************************** Primary View *****************************/
  primaryView = createView(
    mainWindow,
    join('app', 'primary-chart', 'primary-chart.html'),
    {
      webPreferences: {
        preload: join(__dirname, 'preload.js'),
        nodeIntegration: false
      }
    }
  );

  // primaryView.webContents.toggleDevTools();

  /****************************** Secondary View ******************************/

  secondaryView = createView(
    mainWindow,
    join('app', 'secondary-chart', 'secondary-chart.html'),
    {
      webPreferences: {
        preload: join(__dirname, 'preload.js'),
        nodeIntegration: false
      }
    }
  );

  // secondaryView.webContents.toggleDevTools();

  // if user resize window views must resize accordingly
  ipcMain.on(
    'resize',
    (
      _event: IpcMainEvent,
      args: {
        primary: Rectangle;
        secondary: Rectangle;
        zoom: number;
      }
    ) => {
      resizeView(primaryView, args.primary);
      resizeView(secondaryView, args.secondary);
      // console.log(args.zoom);
    }
  );

  const menubar = require('./menubar') as Menu;
  menubar.items[process.platform == 'darwin' ? 3 : 2].submenu.insert(
    0,
    new MenuItem({
      label: 'Reload',
      accelerator: 'CmdOrCtrl+R',
      click: () => {
        /**
         * stops the GA if user attemps reload while GA running
         * recreating pyshell to avoid error of calling released function
         * on renderer (error by far only appear on windows)
         */
        pyshell.stdin.write(`${JSON.stringify({ exit: true })}\n`);
        createPyshell();
        mainWindow.webContents.reload();
        primaryView.webContents.reload();
        secondaryView.webContents.reload();
      }
    })
  );

  Menu.setApplicationMenu(menubar);
});
