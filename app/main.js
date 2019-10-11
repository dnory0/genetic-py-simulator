"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
const fs_1 = require("fs");
const child_process_1 = require("child_process");
const isDev = electron_1.app.getAppPath().indexOf('.asar') === -1;
let mainWindow;
let primaryView;
let secondaryView;
let pyshell;
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
            nodeIntegration,
            preload
        }
    });
    targetWindow.loadFile(filePath);
    targetWindow.once('ready-to-show', targetWindow.show);
    targetWindow.on('close', () => {
        pyshell.stdin.write(`${JSON.stringify({ exit: true })}\n`);
    });
    targetWindow.once('closed', () => {
        targetWindow = null;
    });
    return targetWindow;
};
const resizeView = (targetView, { x = 0, y = 0, width = mainWindow.getBounds().width, height = mainWindow.getBounds().height } = {}) => {
    targetView.setBounds({
        x,
        y,
        width,
        height
    });
};
const createView = (parentWindow, filePath, { x, y, width, height }, { webPreferences: { preload, nodeIntegration } } = {}) => {
    let targetView = new electron_1.BrowserView({
        webPreferences: {
            preload,
            nodeIntegration
        }
    });
    targetView.setBounds({
        x,
        y,
        width,
        height
    });
    targetView.webContents.loadFile(filePath);
    parentWindow.addBrowserView(targetView);
    return targetView;
};
const createPyshell = () => {
    if (isDev) {
        pyshell = child_process_1.spawn(`${process.platform == 'win32' ? 'python' : 'python3'}`, [
            path_1.join(__dirname, 'python', 'ga.py')
        ]);
    }
    else {
        let copyFrom;
        let copyTo;
        let execExist = fs_1.existsSync(path_1.join(__dirname, 'python', 'dist', process.platform == 'win32'
            ? path_1.join('win', 'ga.exe')
            : path_1.join('linux', 'ga')));
        if (execExist) {
            copyFrom = path_1.join(__dirname, 'python', 'dist', process.platform == 'win32'
                ? path_1.join('win', 'ga.exe')
                : path_1.join('linux', 'ga'));
            copyTo = path_1.join(electron_1.app.getPath('temp'), process.platform == 'win32' ? 'ga.exe' : 'ga');
        }
        else {
            copyFrom = path_1.join(__dirname, 'python', 'ga.py');
            copyTo = path_1.join(electron_1.app.getPath('temp'), 'ga.py');
        }
        fs_1.copyFileSync(copyFrom, copyTo);
        pyshell = child_process_1.spawn(execExist
            ? copyTo
            : `${process.platform == 'win32' ? 'python' : 'python3'}`, execExist ? [] : [copyTo]);
    }
    module.exports = pyshell;
};
electron_1.app.once('ready', () => {
    createPyshell();
    mainWindow = createWindow(path_1.join('app', 'index.html'), {
        minWidth: 580,
        minHeight: 430,
        webPreferences: {
            preload: path_1.join(__dirname, 'preload.js'),
            nodeIntegration: false
        }
    });
    mainWindow.on('enter-full-screen', () => {
        mainWindow.setMenuBarVisibility(true);
    });
    primaryView = createView(mainWindow, path_1.join('app', 'primary-chart', 'primary-chart.html'), {
        x: 0,
        y: 0,
        width: mainWindow.getBounds().width -
            (process.platform == 'win32' && !mainWindow.isFullScreen() ? 16 : 0),
        height: Math.floor(mainWindow.getBounds().height * 0.5 -
            (process.platform == 'win32' && !mainWindow.isFullScreen() ? 17 : 0))
    }, {
        webPreferences: {
            preload: path_1.join(__dirname, 'preload.js'),
            nodeIntegration: false
        }
    });
    secondaryView = createView(mainWindow, path_1.join('app', 'secondary-chart', 'secondary-chart.html'), {
        x: Math.floor(mainWindow.getBounds().width / 2) +
            (process.platform == 'win32' && !mainWindow.isFullScreen() ? -3 : 5),
        y: Math.floor(mainWindow.getBounds().height / 2) +
            (process.platform == 'win32'
                ? mainWindow.isFullScreen()
                    ? 4
                    : -16
                : 1),
        width: Math.floor(mainWindow.getBounds().width / 2) -
            (process.platform == 'win32' && !mainWindow.isFullScreen() ? 14 : 5),
        height: Math.floor(mainWindow.getBounds().height / 2) -
            (process.platform == 'win32'
                ? mainWindow.isFullScreen()
                    ? 48
                    : 67
                : 50)
    }, {
        webPreferences: {
            preload: path_1.join(__dirname, 'preload.js'),
            nodeIntegration: false
        }
    });
    mainWindow.on('resize', () => {
        setTimeout(() => {
            resizeView(primaryView, {
                width: mainWindow.getBounds().width -
                    (process.platform == 'win32' && !mainWindow.isFullScreen() ? 16 : 0),
                height: Math.floor(mainWindow.getBounds().height * 0.5 -
                    (process.platform == 'win32' && !mainWindow.isFullScreen() ? 17 : 0))
            });
            resizeView(secondaryView, {
                x: Math.floor(mainWindow.getBounds().width / 2) +
                    (process.platform == 'win32' && !mainWindow.isFullScreen() ? -3 : 5),
                y: Math.floor(mainWindow.getBounds().height / 2) +
                    (process.platform == 'win32'
                        ? mainWindow.isFullScreen()
                            ? 4
                            : -16
                        : 1),
                width: Math.floor(mainWindow.getBounds().width / 2) -
                    (process.platform == 'win32' && !mainWindow.isFullScreen() ? 14 : 5),
                height: Math.floor(mainWindow.getBounds().height / 2) -
                    (process.platform == 'win32'
                        ? mainWindow.isFullScreen()
                            ? 48
                            : 67
                        : 50)
            });
        }, 100);
    });
    const menubar = require('./menubar');
    menubar.items[process.platform == 'darwin' ? 3 : 2].submenu.insert(0, new electron_1.MenuItem({
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: () => {
            pyshell.stdin.write(`${JSON.stringify({ exit: true })}\n`);
            createPyshell();
            mainWindow.webContents.reload();
            primaryView.webContents.reload();
            secondaryView.webContents.reload();
        }
    }));
    electron_1.Menu.setApplicationMenu(menubar);
});
//# sourceMappingURL=main.js.map