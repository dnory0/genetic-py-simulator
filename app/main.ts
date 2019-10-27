import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  Menu,
  MenuItem
} from 'electron';
import { join } from 'path';
import { writeFile, mkdir } from 'fs';

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
      webviewTag: true,
      nodeIntegration: false,
      preload
    }
  });

  targetWindow.loadFile(filePath);

  targetWindow.once('ready-to-show', targetWindow.show);

  targetWindow.once('closed', () => {
    /**
     * free targetWindow
     */
    targetWindow = null;
    /**
     * exit the GA and kill spawned process, usually called on exit or reload app.
     */
    // pyshell.stdin.write(`${JSON.stringify({ exit: true })}\n`);
  });
  return targetWindow;
};

app.once('ready', () => {
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

  const menubar = require('./menubar') as Menu;

  menubar.items[process.platform == 'darwin' ? 3 : 2].submenu.insert(
    0,
    new MenuItem({
      label: 'Reload',
      accelerator: 'CmdOrCtrl+R',
      click: () => {
        mainWindow.webContents.send('reload');
        process.nextTick(() => {
          mainWindow.webContents.reload();
        });
      }
    })
  );

  menubar.items[process.platform == 'darwin' ? 3 : 2].submenu.insert(
    3,
    new MenuItem({
      label: 'Reset Zoom',
      accelerator: 'CmdOrCtrl+num0',
      click: () => mainWindow.webContents.send('zoom', '')
    })
  );

  menubar.items[process.platform == 'darwin' ? 3 : 2].submenu.insert(
    4,
    new MenuItem({
      label: 'Zoom In',
      accelerator: 'CmdOrCtrl+numadd',
      click: () => mainWindow.webContents.send('zoom', 'in')
    })
  );

  menubar.items[process.platform == 'darwin' ? 3 : 2].submenu.insert(
    5,
    new MenuItem({
      label: 'Zoom Out',
      accelerator: 'CmdOrCtrl+numsub',
      click: () => mainWindow.webContents.send('zoom', 'out')
    })
  );

  menubar.items[process.platform == 'darwin' ? 3 : 2].submenu.insert(
    6,
    new MenuItem({
      type: 'separator'
    })
  );

  Menu.setApplicationMenu(menubar);
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
