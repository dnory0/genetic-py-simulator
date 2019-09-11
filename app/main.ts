import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  ipcMain,
  Menu
} from "electron";
import { fork, ChildProcess } from "child_process";
import { join } from "path";
/******************* MAIN WINDOW HANDLING *******************
 *************************************************************/
let mainWindow: BrowserWindow = null;
let timeProcess: ChildProcess;

/**
 * @param filePath  string  path to an HTML file relative to the root of your application
 * @param options   constructor options for the browser window returned
 */
const createWindow = (
  filePath: string,
  {
    minWidth,
    minHeight,
    width,
    height,
    resizable,
    minimizable,
    maximizable,
    parent,
    frame
  }: BrowserWindowConstructorOptions = {}
): BrowserWindow => {
  let targetWindow = new BrowserWindow({
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

  targetWindow.once("ready-to-show", () => targetWindow.show());

  targetWindow.once("closed", () => {
    timeProcess.kill();
    targetWindow = null;
  });
  return targetWindow;
};

app.on("ready", () => {
  mainWindow = exports.mainWindow = createWindow("app/index.html", {
    minWidth: 620,
    minHeight: 480
  });

  // mainWindow.setAutoHideMenuBar(true);
  // mainWindow.setMenuBarVisibility(false);

  const menubar = require("./menubar") as Menu;
  app.applicationMenu = menubar;

  // mainWindow.setFullScreen(true);
  // Menu.setApplicationMenu(null);

  timeProcess = fork("app/secondary-process.js");
  timeProcess.on("message", (message: string) => {
    if (message.includes("time: "))
      mainWindow.webContents.send("time", `${message.slice(6)}`);
    else if (message.includes("cpuusage: "))
      mainWindow.webContents.send("cpuusage", `${message.slice(10)}%`);
    else if (message === "time-finished")
      mainWindow.webContents.send("time-finished");
  });

  ipcMain.on("time", (_event, state: string) => {
    timeProcess.send(state);
  });
});
