"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
const fs_1 = require("fs");
const isDev = process.argv.some(arg => ['--dev', '-D', '-d'].includes(arg));
global['isDev'] = isDev;
let mainWindow;
let gaWindow;
const pyshell = require(path_1.join(__dirname, 'modules', 'create-pyshell.js'))(electron_1.app);
global['pyshell'] = pyshell;
let runSettings = require(path_1.join(__dirname, 'modules', 'load-settings.js'))(path_1.join(electron_1.app.getPath('userData'), 'settings.json'), path_1.join(__dirname, '..', 'settings.json'));
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
        modal: true,
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
const browse = (window, options, resolved, rejected) => {
    electron_1.dialog
        .showOpenDialog(window, options)
        .then(resolved)
        .catch(rejected);
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
    mainWindow.setMenu(require(path_1.join(__dirname, 'modules', 'menubar.js'))(isDev, mainWindow));
    mainWindow.webContents.on('ipc-message', (_ev, channel, args) => {
        let confirmClose = () => {
            return electron_1.dialog.showMessageBox(gaWindow, {
                type: 'question',
                title: 'Are you sure?',
                message: 'You have unsaved changes, are you sure you want to close?',
                cancelId: 0,
                defaultId: 1,
                buttons: ['Ca&ncel', '&Confirm'],
                normalizeAccessKeys: true
            });
        };
        if (channel == 'ga-cp') {
            gaWindow = createWindow(path_1.join(__dirname, 'ga-cp', 'ga-cp.html'), {
                minWidth: 680,
                minHeight: 480,
                parent: mainWindow,
                webPreferences: {
                    preload: path_1.join(__dirname, 'preloads', 'ga-cp-preload.js')
                }
            });
            gaWindow.once('ready-to-show', gaWindow.show);
            if (!isDev)
                gaWindow.removeMenu();
            gaWindow.webContents.on('ipc-message', (_ev, gaChannel, gaCPConfig) => {
                if (gaChannel == 'ga-cp-finished') {
                    mainWindow.webContents.send('ga-cp-finished', gaCPConfig);
                    gaWindow.destroy();
                }
                else if (gaChannel == 'close-confirm') {
                    (() => __awaiter(void 0, void 0, void 0, function* () {
                        yield confirmClose()
                            .then(result => {
                            if (result.response) {
                                mainWindow.webContents.send('ga-cp-finished', gaCPConfig);
                                gaWindow.destroy();
                            }
                        })
                            .catch(reason => {
                            if (reason)
                                throw reason;
                        });
                    }))();
                }
                else if (gaChannel == 'browse') {
                    browse(gaWindow, {
                        title: 'Open GA Configuration file',
                        defaultPath: electron_1.app.getPath('desktop'),
                        filters: [
                            {
                                name: 'Python File (.py)',
                                extensions: ['py']
                            }
                        ],
                        properties: ['openFile']
                    }, result => gaWindow.webContents.send('browsed-path', result), reason => {
                        gaWindow.webContents.send('browsed-path', { canceled: true });
                        if (reason)
                            throw reason;
                    });
                }
                else if (gaChannel == 'settings') {
                    gaWindow.webContents.send('settings', args);
                }
            });
            gaWindow.on('close', ev => {
                ev.preventDefault();
                gaWindow.webContents.send('close-confirm');
            });
        }
        else if (channel == '') {
            if (gaWindow && !gaWindow.isDestroyed())
                gaWindow.close();
        }
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
        mainWindow.webContents.send('settings');
        mainWindow.webContents.once('ipc-message', (_ev, channel, settings) => {
            if (channel != 'settings')
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
electron_1.app.once('will-quit', () => pyshell.stdin.write('exit\n'));
//# sourceMappingURL=main.js.map