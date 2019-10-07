import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  Menu,
  MenuItem,
  BrowserView,
  BrowserViewConstructorOptions,
  Rectangle,
  AutoResizeOptions
} from 'electron';
import { join } from 'path';
/******************* MAIN WINDOW HANDLING *******************
 *************************************************************/
/**
 * main window
 */
let mainWindow: BrowserWindow;
let progressView: BrowserView;
let fittestView: BrowserView;

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

  targetWindow.once('ready-to-show', () => targetWindow.show());

  targetWindow.once('closed', () => {
    targetWindow = null;
  });
  return targetWindow;
};

/**
 * @param filePath    string path to an HTML file relative to the root of your application
 * @param bounds      positioning of the browserView
 * @param options     constructor options for the browser view returned
 * @param autoResize  whether to and how to resize the view according to parent window, by Default everything is false
 */
const createView = (
  filePath: string,
  { x, y, width, height }: Rectangle,
  {
    webPreferences: { preload, nodeIntegration }
  }: BrowserViewConstructorOptions = {},
  autoResize: AutoResizeOptions = {
    width: false,
    height: false,
    horizontal: false,
    vertical: false
  }
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
  targetView.setAutoResize(autoResize);

  targetView.webContents.loadFile(filePath);

  return targetView;
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
    join('app', 'progress-chart.html'),
    {
      x: 0,
      y: 0,
      width: mainWindow.getBounds().width,
      height: mainWindow.getBounds().height
    },
    {
      webPreferences: {
        preload: join(__dirname, 'preload.js'),
        nodeIntegration: true
      }
    },
    {
      width: true,
      height: true
    } as AutoResizeOptions
  );

  mainWindow.addBrowserView(progressView);

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
