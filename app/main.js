"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
const fs_1 = require("fs");
const isDev = process.argv.some(arg => ['--dev', '-D', '-d'].includes(arg));
let mainWindow;
let runSettings;
require(path_1.join(__dirname, 'modules', 'load-settings.js'))(path_1.join(electron_1.app.getPath('userData'), 'settings.json'), path_1.join(__dirname, '..', 'settings.json'), (settings) => (runSettings = settings));
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
    targetWindow.once('closed', () => {
        targetWindow = null;
    });
    return targetWindow;
};
electron_1.app.once('ready', () => {
    process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;
    mainWindow = createWindow(path_1.join(__dirname, 'index.html'), {
        minWidth: 720,
        minHeight: 500,
        webPreferences: {
            preload: path_1.join(__dirname, 'preloads', 'preload.js'),
            webviewTag: true
        }
    });
    mainWindow.on('enter-full-screen', () => {
        mainWindow.autoHideMenuBar = true;
        mainWindow.setMenuBarVisibility(false);
    });
    mainWindow.on('leave-full-screen', () => {
        mainWindow.setMenuBarVisibility(true);
        mainWindow.autoHideMenuBar = false;
    });
    electron_1.app.applicationMenu = require(path_1.join(__dirname, 'modules', 'menubar.js'))(isDev, mainWindow);
    mainWindow.webContents.on('ipc-message', (_ev, channel) => {
        if (channel == 'mode')
            mainWindow.webContents.send('mode', isDev);
    });
    (() => {
        let readyToShow = () => {
            mainWindow.setSize(runSettings['main']['width'] ? runSettings['main']['width'] : 720, runSettings['main']['height'] ? runSettings['main']['height'] : 500);
            if (runSettings['main']['x'] && runSettings['main']['y'])
                mainWindow.setBounds({
                    x: runSettings['main']['x'] ? runSettings['main']['x'] : -200,
                    y: runSettings['main']['y'] ? runSettings['main']['y'] : -200
                });
            mainWindow.setFullScreen(runSettings['main']['fscreen'] ? true : false);
            if (runSettings['main']['maximized'])
                mainWindow.maximize();
            mainWindow.show();
        };
        mainWindow.once('ready-to-show', () => {
            if (runSettings)
                readyToShow();
            else {
                let settingsTimer = setInterval(() => {
                    if (!runSettings)
                        return;
                    clearInterval(settingsTimer);
                    readyToShow();
                }, 100);
            }
        });
    })();
    mainWindow.on('close', () => {
        mainWindow.webContents.send('cur-settings');
        mainWindow.webContents.once('ipc-message', (_ev, channel, settings) => {
            if (channel != 'cur-settings')
                return;
            settings['main']['fscreen'] = mainWindow.isFullScreen();
            settings['main']['maximized'] = mainWindow.isMaximized();
            settings['main']['width'] = mainWindow.getSize()[0];
            settings['main']['height'] = mainWindow.getSize()[1];
            if (mainWindow.getBounds().x && mainWindow.getBounds().y) {
                settings['main']['x'] = mainWindow.getBounds().x;
                settings['main']['y'] = mainWindow.getBounds().y;
            }
            fs_1.writeFile(path_1.join(electron_1.app.getPath('userData'), 'settings.json'), JSON.stringify(settings), err => {
                if (err)
                    throw err;
            });
        });
    });
});
//# sourceMappingURL=main.js.map