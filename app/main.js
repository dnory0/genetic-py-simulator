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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1Q0FNa0I7QUFNbEIsSUFBSSxVQUF5QixDQUFDO0FBTzlCLE1BQU0sWUFBWSxHQUFHLENBQ25CLFFBQWdCLEVBQ2hCLEVBQ0UsUUFBUSxFQUNSLFNBQVMsRUFDVCxLQUFLLEVBQ0wsTUFBTSxFQUNOLFNBQVMsRUFDVCxXQUFXLEVBQ1gsV0FBVyxFQUNYLE1BQU0sRUFDTixLQUFLLEtBQzhCLEVBQUUsRUFDeEIsRUFBRTtJQUNqQixJQUFJLFlBQVksR0FBRyxJQUFJLHdCQUFhLENBQUM7UUFDbkMsUUFBUTtRQUNSLFNBQVM7UUFDVCxLQUFLO1FBQ0wsTUFBTTtRQUNOLFNBQVM7UUFDVCxXQUFXO1FBQ1gsV0FBVztRQUNYLE1BQU07UUFDTixLQUFLO1FBQ0wsSUFBSSxFQUFFLEtBQUs7UUFDWCxjQUFjLEVBQUU7WUFDZCxlQUFlLEVBQUUsSUFBSTtTQUN0QjtLQUNGLENBQUMsQ0FBQztJQUVILFlBQVksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFaEMsWUFBWSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7SUFFOUQsWUFBWSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLEVBQUU7UUFDeEMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RDLFlBQVksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMzQyxDQUFDLENBQUMsQ0FBQztJQUVILFlBQVksQ0FBQyxFQUFFLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxFQUFFO1FBQ3hDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2QyxZQUFZLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUMsQ0FBQyxDQUFDLENBQUM7SUFFSCxZQUFZLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7UUFDNUIsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDekMsQ0FBQyxDQUFDLENBQUM7SUFFSCxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUU7UUFDL0IsWUFBWSxHQUFHLElBQUksQ0FBQztJQUN0QixDQUFDLENBQUMsQ0FBQztJQUNILE9BQU8sWUFBWSxDQUFDO0FBQ3RCLENBQUMsQ0FBQztBQUVGLGNBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtJQUNyQixVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsR0FBRyxZQUFZLENBQUMsZ0JBQWdCLEVBQUU7UUFDL0QsUUFBUSxFQUFFLEdBQUc7UUFDYixTQUFTLEVBQUUsR0FBRztLQUNmLENBQUMsQ0FBQztJQUVILE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQVMsQ0FBQztJQUM3QyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQ2hFLElBQUksbUJBQVEsQ0FBQztRQUNYLEtBQUssRUFBRSxRQUFRO1FBQ2YsV0FBVyxFQUFFLGFBQWE7UUFDMUIsS0FBSyxFQUFFLEdBQUcsRUFBRTtZQUNWLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZDLFVBQVUsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDbEMsQ0FBQztLQUNGLENBQUMsQ0FDSCxDQUFDO0lBRUYsY0FBRyxDQUFDLGVBQWUsR0FBRyxPQUFPLENBQUM7QUFDaEMsQ0FBQyxDQUFDLENBQUMifQ==