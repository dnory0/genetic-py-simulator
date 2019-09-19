"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var mainWindow = null;
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
    targetWindow.once('ready-to-show', function () { return targetWindow.show(); });
    targetWindow.on('close', function () {
        mainWindow.webContents.send('pyshell');
    });
    targetWindow.once('closed', function () {
        targetWindow = null;
    });
    return targetWindow;
};
electron_1.app.on('ready', function () {
    mainWindow = exports.mainWindow = createWindow('app/index.html', {
        minWidth: 620,
        minHeight: 480
    });
    var menubar = require('./menubar');
    menubar.items[process.platform == 'darwin' ? 3 : 2].submenu.append(new electron_1.MenuItem({
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: function () {
            mainWindow.webContents.send('pyshell');
            mainWindow.webContents.reload();
        }
    }));
    electron_1.app.applicationMenu = menubar;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FPa0I7QUFJbEIsSUFBSSxVQUFVLEdBQWtCLElBQUksQ0FBQztBQU9yQyxJQUFNLFlBQVksR0FBRyxVQUNuQixRQUFnQixFQUNoQixFQVV1QztRQVZ2Qyw0QkFVdUMsRUFUckMsc0JBQVEsRUFDUix3QkFBUyxFQUNULGdCQUFLLEVBQ0wsa0JBQU0sRUFDTix3QkFBUyxFQUNULDRCQUFXLEVBQ1gsNEJBQVcsRUFDWCxrQkFBTSxFQUNOLGdCQUFLO0lBR1AsSUFBSSxZQUFZLEdBQUcsSUFBSSx3QkFBYSxDQUFDO1FBQ25DLFFBQVEsVUFBQTtRQUNSLFNBQVMsV0FBQTtRQUNULEtBQUssT0FBQTtRQUNMLE1BQU0sUUFBQTtRQUNOLFNBQVMsV0FBQTtRQUNULFdBQVcsYUFBQTtRQUNYLFdBQVcsYUFBQTtRQUNYLE1BQU0sUUFBQTtRQUNOLEtBQUssT0FBQTtRQUNMLElBQUksRUFBRSxLQUFLO1FBQ1gsY0FBYyxFQUFFO1lBQ2QsZUFBZSxFQUFFLElBQUk7U0FDdEI7S0FDRixDQUFDLENBQUM7SUFFSCxZQUFZLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRWhDLFlBQVksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLGNBQU0sT0FBQSxZQUFZLENBQUMsSUFBSSxFQUFFLEVBQW5CLENBQW1CLENBQUMsQ0FBQztJQUU5RCxZQUFZLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRTtRQUN2QixVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN6QyxDQUFDLENBQUMsQ0FBQztJQUVILFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1FBRTFCLFlBQVksR0FBRyxJQUFJLENBQUM7SUFDdEIsQ0FBQyxDQUFDLENBQUM7SUFDSCxPQUFPLFlBQVksQ0FBQztBQUN0QixDQUFDLENBQUM7QUFFRixjQUFHLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRTtJQUNkLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxHQUFHLFlBQVksQ0FBQyxnQkFBZ0IsRUFBRTtRQUMvRCxRQUFRLEVBQUUsR0FBRztRQUNiLFNBQVMsRUFBRSxHQUFHO0tBQ2YsQ0FBQyxDQUFDO0lBS0gsSUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBUyxDQUFDO0lBQzdDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FDaEUsSUFBSSxtQkFBUSxDQUFDO1FBQ1gsS0FBSyxFQUFFLFFBQVE7UUFDZixXQUFXLEVBQUUsYUFBYTtRQUMxQixLQUFLLEVBQUU7WUFDTCxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN2QyxVQUFVLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2xDLENBQUM7S0FDRixDQUFDLENBQ0gsQ0FBQztJQUNGLGNBQUcsQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDO0FBa0JoQyxDQUFDLENBQUMsQ0FBQyJ9