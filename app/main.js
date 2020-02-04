"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
const isDev = process.argv.some(arg => ['--dev', '-D', '-d'].includes(arg));
let mainWindow;
const createWindow = (filePath, { minWidth, minHeight, width, height, resizable, minimizable, maximizable, parent, frame, webPreferences: { preload, webviewTag } } = {}) => {
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
            preload,
            webviewTag
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
    if (isDev)
        process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;
    mainWindow = createWindow(path_1.join(__dirname, 'index.html'), {
        minWidth: 580,
        minHeight: 430,
        webPreferences: {
            preload: path_1.join(__dirname, 'preloads', 'preload.js'),
            webviewTag: true
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
    electron_1.app.applicationMenu = require(path_1.join(__dirname, 'modules', 'menubar.js'))(isDev, mainWindow);
    mainWindow.webContents.on('ipc-message', (_ev, channel) => {
        if (channel == 'mode')
            mainWindow.webContents.send('mode', isDev);
    });
});
//# sourceMappingURL=main.js.map