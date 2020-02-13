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
    (() => {
        let readyToShow = () => {
            mainWindow.setSize(runSettings['app']['width'] ? runSettings['app']['width'] : 720, runSettings['app']['height'] ? runSettings['app']['height'] : 500);
            if (runSettings['app']['x'] && runSettings['app']['y'])
                mainWindow.setBounds({
                    x: runSettings['app']['x'] ? runSettings['app']['x'] : -200,
                    y: runSettings['app']['y'] ? runSettings['app']['y'] : -200
                });
            mainWindow.setFullScreen(runSettings['app']['fscreen'] ? true : false);
            if (runSettings['app']['maximized'])
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
            settings['app']['fscreen'] = mainWindow.isFullScreen();
            settings['app']['maximized'] = mainWindow.isMaximized();
            settings['app']['width'] = mainWindow.getSize()[0];
            settings['app']['height'] = mainWindow.getSize()[1];
            if (mainWindow.getBounds().x && mainWindow.getBounds().y) {
                settings['app']['x'] = mainWindow.getBounds().x;
                settings['app']['y'] = mainWindow.getBounds().y;
            }
            fs_1.writeFile(path_1.join(electron_1.app.getPath('userData'), 'settings.json'), JSON.stringify(settings), err => {
                if (err)
                    throw err;
            });
        });
    });
});
//# sourceMappingURL=main.js.map