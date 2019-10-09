"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
const fs_1 = require("fs");
const child_process_1 = require("child_process");
const isDev = __dirname.indexOf(".asar") === -1;
let mainWindow;
let progressView;
let fittestView;
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
    targetWindow.once("ready-to-show", () => {
        targetWindow.show();
        initPyshell();
    });
    targetWindow.on("close", () => {
        pyshell.stdin.write(`${JSON.stringify({ exit: true })}\n`);
    });
    targetWindow.once("closed", () => {
        pyshell.stdin.write(`${JSON.stringify({ exit: true })}\n`);
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
const initPyshell = () => {
    if (isDev) {
        pyshell = child_process_1.spawn(`${process.platform == "win32" ? "python" : "python3"}`, [
            path_1.join(__dirname, "python", "ga.py")
        ]);
    }
    else {
        let copyFrom;
        let copyTo;
        let execExist = fs_1.existsSync(path_1.join(__dirname, "python", "dist", process.platform == "win32"
            ? path_1.join("win", "ga.exe")
            : path_1.join("linux", "ga")));
        if (execExist) {
            copyFrom = path_1.join(__dirname, "python", "dist", process.platform == "win32"
                ? path_1.join("win", "ga.exe")
                : path_1.join("linux", "ga"));
            copyTo = path_1.join(electron_1.app.getPath("temp"), process.platform == "win32" ? "ga.exe" : "ga");
        }
        else {
            copyFrom = path_1.join(__dirname, "python", "ga.py");
            copyTo = path_1.join(electron_1.app.getPath("temp"), "ga.py");
        }
        fs_1.copyFileSync(copyFrom, copyTo);
        pyshell = child_process_1.spawn(execExist
            ? copyTo
            : `${process.platform == "win32" ? "python" : "python3"}`, execExist ? [] : [copyTo]);
    }
    exports.pyshell = pyshell;
};
electron_1.app.once("ready", () => {
    mainWindow = createWindow(path_1.join("app", "index.html"), {
        minWidth: 580,
        minHeight: 430
    });
    mainWindow.on("enter-full-screen", () => {
        mainWindow.setMenuBarVisibility(true);
    });
    progressView = createView(mainWindow, path_1.join("app", "progress-chart", "progress-chart.html"), {
        x: 0,
        y: 0,
        width: mainWindow.getBounds().width -
            (process.platform == "win32" && !mainWindow.isFullScreen() ? 16 : 0),
        height: Math.floor(mainWindow.getBounds().height * 0.5 -
            (process.platform == "win32" && !mainWindow.isFullScreen() ? 17 : 0))
    }, {
        webPreferences: {
            preload: path_1.join(__dirname, "preload.js"),
            nodeIntegration: false
        }
    });
    progressView.webContents.toggleDevTools();
    fittestView = createView(mainWindow, path_1.join("app", "fittest-chart", "fittest-chart.html"), {
        x: Math.floor(mainWindow.getBounds().width / 2) + 5,
        y: Math.floor(mainWindow.getBounds().height / 2) + 1,
        width: Math.floor(mainWindow.getBounds().width / 2) - 5,
        height: Math.floor(mainWindow.getBounds().height / 2) - 50
    }, {
        webPreferences: {
            preload: path_1.join(__dirname, "preload.js"),
            nodeIntegration: false
        }
    });
    fittestView.webContents.toggleDevTools();
    mainWindow.on("resize", () => {
        setTimeout(() => {
            resizeView(progressView, {
                width: mainWindow.getBounds().width -
                    (process.platform == "win32" && !mainWindow.isFullScreen() ? 16 : 0),
                height: Math.floor(mainWindow.getBounds().height * 0.5 -
                    (process.platform == "win32" && !mainWindow.isFullScreen() ? 17 : 0))
            });
            resizeView(fittestView, {
                x: Math.floor(mainWindow.getBounds().width / 2) + 5,
                y: Math.floor(mainWindow.getBounds().height / 2) + 1,
                width: Math.floor(mainWindow.getBounds().width / 2) - 5,
                height: Math.floor(mainWindow.getBounds().height / 2) - 50
            });
        }, 100);
    });
    const menubar = require("./menubar");
    menubar.items[process.platform == "darwin" ? 3 : 2].submenu.insert(0, new electron_1.MenuItem({
        label: "Reload",
        accelerator: "CmdOrCtrl+R",
        click: () => {
            mainWindow.webContents.reload();
            progressView.webContents.reload();
            fittestView.webContents.reload();
        }
    }));
    electron_1.Menu.setApplicationMenu(menubar);
});
//# sourceMappingURL=main.js.map