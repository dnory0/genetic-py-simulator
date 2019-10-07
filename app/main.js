"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
const fs_1 = require("fs");
const child_process_1 = require("child_process");
const isDev = __dirname.indexOf('.asar') === -1;
let mainWindow;
let progressView;
let pyshell;
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
    targetWindow.once('ready-to-show', () => {
        targetWindow.show();
        initPyshell();
    });
    targetWindow.once('closed', () => {
        targetWindow = null;
    });
    return targetWindow;
};
const createView = (filePath, { x, y, width, height }, { webPreferences: { preload, nodeIntegration } } = {}, autoResize = {
    width: false,
    height: false,
    horizontal: false,
    vertical: false
}) => {
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
    targetView.setAutoResize(autoResize);
    targetView.webContents.loadFile(filePath);
    return targetView;
};
const initPyshell = () => {
    if (isDev) {
        pyshell = exports.pyshell = child_process_1.spawn(`${process.platform == 'win32' ? 'python' : 'python3'}`, [path_1.join(__dirname, 'python', 'ga.py')]);
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
        pyshell = exports.pyshell = child_process_1.spawn(execExist
            ? copyTo
            : `${process.platform == 'win32' ? 'python' : 'python3'}`, execExist ? [] : [copyTo]);
    }
};
electron_1.app.once('ready', () => {
    mainWindow = createWindow(path_1.join('app', 'index.html'), {
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
    progressView = createView(path_1.join('app', 'progress-chart', 'progress-chart.html'), {
        x: 0,
        y: 0,
        width: mainWindow.getBounds().width,
        height: mainWindow.getBounds().height
    }, {
        webPreferences: {
            preload: path_1.join(__dirname, 'preload.js'),
            nodeIntegration: false
        }
    }, {
        width: true,
        height: true
    });
    progressView.webContents.toggleDevTools();
    mainWindow.addBrowserView(progressView);
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