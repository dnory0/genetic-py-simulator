"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
let mainWindow;
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
    targetWindow.once('ready-to-show', () => targetWindow.show());
    targetWindow.on('enter-full-screen', () => {
        targetWindow.setAutoHideMenuBar(true);
        targetWindow.setMenuBarVisibility(false);
    });
    targetWindow.on('leave-full-screen', () => {
        targetWindow.setAutoHideMenuBar(false);
        targetWindow.setMenuBarVisibility(true);
    });
    targetWindow.on('close', () => {
        mainWindow.webContents.send('pyshell');
    });
    targetWindow.once('closed', () => {
        targetWindow = null;
    });
    return targetWindow;
};
electron_1.app.once('ready', () => {
    mainWindow = exports.mainWindow = createWindow('app/index.html', {
        minWidth: 580,
        minHeight: 430
    });
    let view = new electron_1.BrowserView({
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.setBrowserView(view);
    view.setBounds({
        x: 0,
        y: 36,
        width: mainWindow.getBounds().width,
        height: mainWindow.getBounds().height
    });
    mainWindow.on('will-resize', (_event, newBounds) => {
        console.log(newBounds);
    });
    view.setAutoResize({
        height: true,
        width: true
    });
    view.webContents.loadFile('app/progress-chart.html');
    view.webContents.toggleDevTools();
    let i = 0;
    setInterval(() => {
        view.webContents.send('data', { [--i]: 'hi', [--i]: 'world' });
    }, 500);
    const menubar = require('./menubar');
    menubar.items[process.platform == 'darwin' ? 3 : 2].submenu.append(new electron_1.MenuItem({
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: () => {
            mainWindow.webContents.send('pyshell');
            mainWindow.webContents.reload();
        }
    }));
    electron_1.app.applicationMenu = menubar;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1Q0FTa0I7QUFPbEIsSUFBSSxVQUF5QixDQUFDO0FBTzlCLE1BQU0sWUFBWSxHQUFHLENBQ25CLFFBQWdCLEVBQ2hCLEVBQ0UsUUFBUSxFQUNSLFNBQVMsRUFDVCxLQUFLLEVBQ0wsTUFBTSxFQUNOLFNBQVMsRUFDVCxXQUFXLEVBQ1gsV0FBVyxFQUNYLE1BQU0sRUFDTixLQUFLLEtBQzhCLEVBQUUsRUFDeEIsRUFBRTtJQUNqQixJQUFJLFlBQVksR0FBRyxJQUFJLHdCQUFhLENBQUM7UUFDbkMsUUFBUTtRQUNSLFNBQVM7UUFDVCxLQUFLO1FBQ0wsTUFBTTtRQUNOLFNBQVM7UUFDVCxXQUFXO1FBQ1gsV0FBVztRQUNYLE1BQU07UUFDTixLQUFLO1FBQ0wsSUFBSSxFQUFFLEtBQUs7UUFDWCxjQUFjLEVBQUU7WUFDZCxlQUFlLEVBQUUsSUFBSTtTQUN0QjtLQUNGLENBQUMsQ0FBQztJQUVILFlBQVksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFaEMsWUFBWSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7SUFFOUQsWUFBWSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLEVBQUU7UUFDeEMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RDLFlBQVksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMzQyxDQUFDLENBQUMsQ0FBQztJQUVILFlBQVksQ0FBQyxFQUFFLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxFQUFFO1FBQ3hDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2QyxZQUFZLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUMsQ0FB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