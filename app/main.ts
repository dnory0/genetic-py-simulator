import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  Menu,
  MenuItem,
  BrowserView,
  BrowserViewConstructorOptions,
  Rectangle
} from 'electron';
import { join } from 'path';
import { existsSync, copyFileSync } from 'fs';
import { spawn, ChildProcess } from 'child_process';

/******************* MAIN WINDOW HANDLING *******************
 *************************************************************/

/**
 * set to true if app on development, false in production.
 *
 * NOTE: app needs to be packed on asar (by default) to detect production mode
 * if you don't set asar to false on electron-builder.json you're good to go
 */
const isDev = __dirname.indexOf('.asar') === -1;

/**
 * main window
 */
let mainWindow: BrowserWindow;
/**
 * progress Chart View
 */
let progressView: BrowserView;
// let fittestView: BrowserView;

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
    frame
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
      nodeIntegration: true
    }
  });

  targetWindow.loadFile(filePath);

  targetWindow.once('ready-to-show', () => {
    targetWindow.show();
    initPyshell();
  });

  targetWindow.on('close', () => {
    pyshell.stdin.write(`${JSON.stringify({ exit: true })}\n`);
  });

  targetWindow.once('closed', () => {
    targetWindow = null;
  });
  return targetWindow;
};

/**
 * resizes browser view
 * @param parentWindow parent window to resize according to
 * @param targetView browser view to resize
 */
const resizeView = (
  targetView: BrowserView,
  {
    x = 0,
    y = 0,
    width = mainWindow.getBounds().width,
    height = mainWindow.getBounds().height
  } = {}
) => {
  targetView.setBounds({
    /**
     * x of target view according to parent window
     */
    x,
    /**
     * y of target view according to parent window
     */
    y,
    /**
     * width of target view
     */
    width,
    /**
     * height of target view
     */
    height
  } as Rectangle);
};

/**
 * @param parentWindow  parent window of the returned view
 * @param filePath      string path to an HTML file relative to the root of your application
 * @param bounds        positioning of the browserView
 * @param options       constructor options for the browser view returned
 */
const createView = (
  parentWindow: BrowserWindow,
  filePath: string,
  { x, y, width, height }: Rectangle,
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

  // default bounds
  targetView.setBounds({
    x,
    y,
    width,
    height
  });

  // if user resize window the viw must resize accordingly
  parentWindow.on('resize', () => {
    setTimeout(() => {
      resizeView(targetView, {
        height: Math.floor(mainWindow.getBounds().height * 0.5)
      });
    }, 100); // 100 ms is relative number that should be revised
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
const initPyshell = () => {
  // if in development
  if (isDev) {
    // works with the script version
    pyshell = exports.pyshell = spawn(
      `${process.platform == 'win32' ? 'python' : 'python3'}`,
      [join(__dirname, 'python', 'ga.py')]
    );
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
    pyshell = exports.pyshell = spawn(
      execExist
        ? copyTo
        : `${process.platform == 'win32' ? 'python' : 'python3'}`,
      execExist ? [] : [copyTo]
    );
  }
};

app.once('ready', () => {
  /****************************** Main Window ******************************
   *************************************************************************/
  mainWindow = createWindow(join('app', 'index.html'), {
    minWidth: 580,
    minHeight: 430
  });

  mainWindow.on('enter-full-screen', () => {
    mainWindow.setAutoHideMenuBar(true);
    mainWindow.setMenuBarVisibility(false);
  });

  mainWindow.on('leave-full-screen', () => {
    mainWindow.setAutoHideMenuBar(false);
    mainWindow.setMenuBarVisibility(true);
  });

  mainWindow.on('close', () => {
    mainWindow.webContents.send('pyshell');
  });

  /***************************** Browser Views *****************************
   *************************************************************************/

  /***************************** Progress View *****************************/
  progressView = createView(
    mainWindow,
    join('app', 'progress-chart', 'progress-chart.html'),
    {
      x: 0,
      y: 0,
      width: mainWindow.getBounds().width,
      height: mainWindow.getBounds().height * 0.5
    },
    {
      webPreferences: {
        preload: join(__dirname, 'preload.js'),
        nodeIntegration: false
      }
    }
  );

  // progressView.webContents.toggleDevTools();

  const menubar = require('./menubar') as Menu;
  menubar.items[process.platform == 'darwin' ? 3 : 2].submenu.insert(
    0,
    new MenuItem({
      label: 'Reload',
      accelerator: 'CmdOrCtrl+R',
      click: () => {
        mainWindow.webContents.send('pyshell');
        mainWindow.webContents.reload();
      }
    })
  );

  app.applicationMenu = menubar;
});
