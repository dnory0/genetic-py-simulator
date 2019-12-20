"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
const isDev = electron_1.app.getAppPath().indexOf('.asar') === -1;
let mainWindow;
const createWindow = (filePath, { minWidth, minHeight, width, height, resizable, minimizable, maximizable, parent, frame, webPreferences: { preload, nodeIntegration, webviewTag } } = {}) => {
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
            nodeIntegration,
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
    mainWindow = createWindow(path_1.join('app', 'index.html'), {
        minWidth: 580,
        minHeight: 430,
        webPreferences: {
            preload: path_1.join(__dirname, 'preload.js'),
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
    electron_1.app.applicationMenu = require('./menubar')(isDev, mainWindow);
    delete require.cache[require.resolve('./menubar')];
});
//# sourceMappingURL=main.js.map