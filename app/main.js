"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
const isDev = electron_1.app.getAppPath().indexOf('.asar') === -1;
let mainWindow;
const createWindow = (filePath, { minWidth, minHeight, width, height, resizable, minimizable, maximizable, parent, frame, webPreferences: { nodeIntegration, preload } } = {}) => {
    let targetWindow = new electron_1.BrowserWindow({
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
        targetWindow = null;
    });
    return targetWindow;
};
electron_1.app.once('ready', () => {
    mainWindow = createWindow(path_1.join('app', 'index.html'), {
        minWidth: 580,
        minHeight: 430,
        webPreferences: {
            preload: path_1.join(__dirname, 'preload.js'),
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
    const menubar = require('./menubar');
    menubar.items[process.platform == 'darwin' ? 3 : 2].submenu.insert(0, new electron_1.MenuItem({
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: () => {
            mainWindow.webContents.send('reload');
            process.nextTick(() => {
                mainWindow.webContents.reload();
            });
        }
    }));
    menubar.items[process.platform == 'darwin' ? 3 : 2].submenu.insert(3, new electron_1.MenuItem({
        label: 'Reset Zoom',
        accelerator: 'CmdOrCtrl+num0',
        click: () => mainWindow.webContents.send('zoom', '')
    }));
    menubar.items[process.platform == 'darwin' ? 3 : 2].submenu.insert(4, new electron_1.MenuItem({
        label: 'Zoom In',
        accelerator: 'CmdOrCtrl+numadd',
        click: () => mainWindow.webContents.send('zoom', 'in')
    }));
    menubar.items[process.platform == 'darwin' ? 3 : 2].submenu.insert(5, new electron_1.MenuItem({
        label: 'Zoom Out',
        accelerator: 'CmdOrCtrl+numsub',
        click: () => mainWindow.webContents.send('zoom', 'out')
    }));
    menubar.items[process.platform == 'darwin' ? 3 : 2].submenu.insert(6, new electron_1.MenuItem({
        type: 'separator'
    }));
    electron_1.Menu.setApplicationMenu(menubar);
});
//# sourceMappingURL=main.js.map