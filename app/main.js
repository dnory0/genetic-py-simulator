"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const child_process_1 = require("child_process");
let mainWindow = null;
let timeProcess;
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
    targetWindow.once("ready-to-show", () => targetWindow.show());
    targetWindow.once("closed", () => {
        timeProcess.kill();
        targetWindow = null;
    });
    return targetWindow;
};
electron_1.app.on("ready", () => {
    mainWindow = exports.mainWindow = createWindow("app/index.html", {
        minWidth: 620,
        minHeight: 480
    });
    const menubar = require("./menubar");
    electron_1.app.applicationMenu = menubar;
    timeProcess = child_process_1.fork("app/secondary-process.js");
    timeProcess.on("message", (message) => {
        if (message.includes("time: "))
            mainWindow.webContents.send("time", `${message.slice(6)}`);
        else if (message.includes("cpuusage: "))
            mainWindow.webContents.send("cpuusage", `${message.slice(10)}%`);
        else if (message === "time-finished")
            mainWindow.webContents.send("time-finished");
    });
    electron_1.ipcMain.on("time", (_event, state) => {
        timeProcess.send(state);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1Q0FNa0I7QUFDbEIsaURBQW1EO0FBSW5ELElBQUksVUFBVSxHQUFrQixJQUFJLENBQUM7QUFDckMsSUFBSSxXQUF5QixDQUFDO0FBTTlCLE1BQU0sWUFBWSxHQUFHLENBQ25CLFFBQWdCLEVBQ2hCLEVBQ0UsUUFBUSxFQUNSLFNBQVMsRUFDVCxLQUFLLEVBQ0wsTUFBTSxFQUNOLFNBQVMsRUFDVCxXQUFXLEVBQ1gsV0FBVyxFQUNYLE1BQU0sRUFDTixLQUFLLEtBQzhCLEVBQUUsRUFDeEIsRUFBRTtJQUNqQixJQUFJLFlBQVksR0FBRyxJQUFJLHdCQUFhLENBQUM7UUFDbkMsUUFBUTtRQUNSLFNBQVM7UUFDVCxLQUFLO1FBQ0wsTUFBTTtRQUNOLFNBQVM7UUFDVCxXQUFXO1FBQ1gsV0FBVztRQUNYLE1BQU07UUFDTixLQUFLO1FBQ0wsSUFBSSxFQUFFLEtBQUs7UUFDWCxjQUFjLEVBQUU7WUFDZCxlQUFlLEVBQUUsSUFBSTtTQUN0QjtLQUNGLENBQUMsQ0FBQztJQUVILFlBQVksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFaEMsWUFBWSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7SUFFOUQsWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFO1FBQy9CLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNuQixZQUFZLEdBQUcsSUFBSSxDQUFDO0lBQ3RCLENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxZQUFZLENBQUM7QUFDdEIsQ0FBQyxDQUFDO0FBRUYsY0FBRyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO0lBQ25CLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxHQUFHLFlBQVksQ0FBQyxnQkFBZ0IsRUFBRTtRQUMvRCxRQUFRLEVBQUUsR0FBRztRQUNiLFNBQVMsRUFBRSxHQUFHO0tBQ2YsQ0FBQyxDQUFDO0lBS0gsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBUyxDQUFDO0lBQzdDLGNBQUcsQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDO0lBSzlCLFdBQVcsR0FBRyxvQkFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUM7SUFDL0MsV0FBVyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxPQUFlLEVBQUUsRUFBRTtRQUM1QyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO1lBQzVCLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQ3hELElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUM7WUFDckMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDOUQsSUFBSSxPQUFPLEtBQUssZUFBZTtZQUNsQyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNqRCxDQUFDLENBQUMsQ0FBQztJQUVILGtCQUFPLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLE1BQU0sRUFBRSxLQUFhLEVBQUUsRUFBRTtRQUMzQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzFCLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMifQ==