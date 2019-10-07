"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
let mainWindow;
const createWindow = (filePath, { minWidth, minHeight, width, height, resizable, minimizable, maximizable, parent, frame } = {}) => {
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
            nodeIntegration: true
        }
    });
    targetWindow.loadFile(filePath);
    targetWindow.once('ready-to-show', () => targetWindow.show());
    targetWindow.on('enter-full-screen', () => {
        targetWindow.setAutoHideMenuBar(true);
        targetWindow.setMenuBarVisibility(false);
    });
    targetWindow.on('leave-full-screen', () => {
        targetWindow.setAutoHideMenuBar(false);
        targetWindow.setMenuBarVisibility(true);
    });
    targetWindow.on('close', () => {
        mainWindow.webContents.send('pyshell');
    });
    targetWindow.once('closed', () => {
        targetWindow = null;
    });
    return targetWindow;
};
electron_1.app.once('ready', () => {
    mainWindow = exports.mainWindow = createWindow('app/index.html', {
        minWidth: 580,
        minHeight: 430
    });
    const menubar = require('./menubar');
    menubar.items[process.platform == 'darwin' ? 3 : 2].submenu.insert(0, new electron_1.MenuItem({
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: () => {
            mainWindow.webContents.send('pyshell');
            mainWindow.webContents.reload();
        }
    }));
    electron_1.app.applicationMenu = menubar;
});
//# sourceMappingURL=main.js.map