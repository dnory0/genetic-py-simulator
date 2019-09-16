"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var child_process_1 = require("child_process");
var mainWindow = null;
var timeProcess;
var createWindow = function (filePath, _a) {
    var _b = _a === void 0 ? {} : _a, minWidth = _b.minWidth, minHeight = _b.minHeight, width = _b.width, height = _b.height, resizable = _b.resizable, minimizable = _b.minimizable, maximizable = _b.maximizable, parent = _b.parent, frame = _b.frame;
    var targetWindow = new electron_1.BrowserWindow({
        minWidth: minWidth,
        minHeight: minHeight,
        width: width,
        height: height,
        resizable: resizable,
        minimizable: minimizable,
        maximizable: maximizable,
        parent: parent,
        frame: frame,
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    targetWindow.loadFile(filePath);
    targetWindow.once("ready-to-show", function () { return targetWindow.show(); });
    targetWindow.once("closed", function () {
        timeProcess.kill();
        targetWindow = null;
    });
    return targetWindow;
};
electron_1.app.on("ready", function () {
    mainWindow = exports.mainWindow = createWindow("app/index.html", {
        minWidth: 620,
        minHeight: 480
    });
    var menubar = require("./menubar");
    electron_1.app.applicationMenu = menubar;
    timeProcess = child_process_1.fork("app/secondary-process.js");
    timeProcess.on("message", function (message) {
        if (message.includes("time: "))
            mainWindow.webContents.send("time", "" + message.slice(6));
        else if (message.includes("cpuusage: "))
            mainWindow.webContents.send("cpuusage", message.slice(10) + "%");
        else if (message === "time-finished")
            mainWindow.webContents.send("time-finished");
    });
    electron_1.ipcMain.on("time", function (_event, state) {
        timeProcess.send(state);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FNa0I7QUFDbEIsK0NBQW1EO0FBSW5ELElBQUksVUFBVSxHQUFrQixJQUFJLENBQUM7QUFDckMsSUFBSSxXQUF5QixDQUFDO0FBTTlCLElBQU0sWUFBWSxHQUFHLFVBQ25CLFFBQWdCLEVBQ2hCLEVBVXVDO1FBVnZDLDRCQVV1QyxFQVRyQyxzQkFBUSxFQUNSLHdCQUFTLEVBQ1QsZ0JBQUssRUFDTCxrQkFBTSxFQUNOLHdCQUFTLEVBQ1QsNEJBQVcsRUFDWCw0QkFBVyxFQUNYLGtCQUFNLEVBQ04sZ0JBQUs7SUFHUCxJQUFJLFlBQVksR0FBRyxJQUFJLHdCQUFhLENBQUM7UUFDbkMsUUFBUSxVQUFBO1FBQ1IsU0FBUyxXQUFBO1FBQ1QsS0FBSyxPQUFBO1FBQ0wsTUFBTSxRQUFBO1FBQ04sU0FBUyxXQUFBO1FBQ1QsV0FBVyxhQUFBO1FBQ1gsV0FBVyxhQUFBO1FBQ1gsTUFBTSxRQUFBO1FBQ04sS0FBSyxPQUFBO1FBQ0wsSUFBSSxFQUFFLEtBQUs7UUFDWCxjQUFjLEVBQUU7WUFDZCxlQUFlLEVBQUUsSUFBSTtTQUN0QjtLQUNGLENBQUMsQ0FBQztJQUVILFlBQVksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFaEMsWUFBWSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsY0FBTSxPQUFBLFlBQVksQ0FBQyxJQUFJLEVBQUUsRUFBbkIsQ0FBbUIsQ0FBQyxDQUFDO0lBRTlELFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1FBQzFCLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNuQixZQUFZLEdBQUcsSUFBSSxDQUFDO0lBQ3RCLENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxZQUFZLENBQUM7QUFDdEIsQ0FBQyxDQUFDO0FBRUYsY0FBRyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUU7SUFDZCxVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsR0FBRyxZQUFZLENBQUMsZ0JBQWdCLEVBQUU7UUFDL0QsUUFBUSxFQUFFLEdBQUc7UUFDYixTQUFTLEVBQUUsR0FBRztLQUNmLENBQUMsQ0FBQztJQUtILElBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQVMsQ0FBQztJQUM3QyxjQUFHLENBQUMsZUFBZSxHQUFHLE9BQU8sQ0FBQztJQUs5QixXQUFXLEdBQUcsb0JBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0lBQy9DLFdBQVcsQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLFVBQUMsT0FBZTtRQUN4QyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO1lBQzVCLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFHLENBQUMsQ0FBQzthQUN4RCxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDO1lBQ3JDLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBSyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxNQUFHLENBQUMsQ0FBQzthQUM5RCxJQUFJLE9BQU8sS0FBSyxlQUFlO1lBQ2xDLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ2pELENBQUMsQ0FBQyxDQUFDO0lBRUgsa0JBQU8sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQUMsTUFBTSxFQUFFLEtBQWE7UUFDdkMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMxQixDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDIn0=