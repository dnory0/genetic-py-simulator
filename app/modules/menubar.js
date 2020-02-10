"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
module.exports = (isDev, targetWindow, beforeReload) => {
    delete require.cache[require.resolve('./menubar')];
    const zoomin = () => targetWindow.webContents.send('zoom', 'in');
    const zoomout = () => targetWindow.webContents.send('zoom', 'out');
    const zoomreset = () => targetWindow.webContents.send('zoom', '');
    const menu = electron_1.Menu.buildFromTemplate([
        {
            label: '&File',
            submenu: [
                { role: 'quit', accelerator: 'CmdOrCtrl+Q' },
                { role: 'close', visible: false }
            ]
        },
        {
            label: '&Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' }
            ]
        },
        {
            label: '&View',
            submenu: [
                {
                    label: '&Reload',
                    accelerator: 'Ctrl+R',
                    click: () => {
                        beforeReload();
                        targetWindow.reload();
                    }
                },
                { type: 'separator' },
                {
                    label: 'Zoom In',
                    accelerator: 'CmdOrCtrl+numadd',
                    click: zoomin
                },
                {
                    label: 'Zoom Out',
                    accelerator: 'CmdOrCtrl+numsub',
                    click: zoomout
                },
                {
                    label: 'Reset Zoom',
                    accelerator: 'CmdOrCtrl+num0',
                    click: zoomreset
                },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        }
    ]);
    if (isDev) {
        menu.items[2].submenu.insert(2, new electron_1.MenuItem({
            label: 'Main Developer Tools',
            accelerator: 'CmdOrCtrl+Shift+I',
            click: () => targetWindow.webContents.toggleDevTools()
        }));
        menu.items[2].submenu.insert(3, new electron_1.MenuItem({
            label: 'prime Developer Tools [Ctrl+²]',
            click: () => targetWindow.webContents.send('devTools', 'prime')
        }));
        menu.items[2].submenu.insert(4, new electron_1.MenuItem({
            label: 'side Developer Tools [Ctrl+Shift+²]',
            click: () => targetWindow.webContents.send('devTools', 'side')
        }));
        menu.items[2].submenu.insert(5, new electron_1.MenuItem({ type: 'separator' }));
    }
    electron_1.globalShortcut.register('CmdOrCtrl+=', zoomin);
    electron_1.globalShortcut.register('CmdOrCtrl+6', zoomout);
    electron_1.globalShortcut.register('CmdOrCtrl+0', zoomreset);
    return menu;
};
//# sourceMappingURL=menubar.js.map