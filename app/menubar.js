"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
module.exports = (isDev, targetWindow) => {
    const menu = electron_1.Menu.buildFromTemplate([
        {
            label: '&File',
            submenu: [
                { role: 'quit', accelerator: 'CmdOrCtrl+Q' }
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
                    role: 'reload'
                },
                { type: 'separator' },
                {
                    label: 'Zoom In',
                    accelerator: 'CmdOrCtrl+numadd',
                    click: () => targetWindow.webContents.send('zoom', 'in')
                },
                {
                    label: 'Zoom Out',
                    accelerator: 'CmdOrCtrl+numsub',
                    click: () => targetWindow.webContents.send('zoom', 'out')
                },
                {
                    label: 'Reset Zoom',
                    accelerator: 'CmdOrCtrl+num0',
                    click: () => targetWindow.webContents.send('zoom', '')
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
            label: 'Primary Developer Tools',
            click: () => targetWindow.webContents.send('devTools', 'primary')
        }));
        menu.items[2].submenu.insert(4, new electron_1.MenuItem({
            label: 'Secondary Developer Tools',
            click: () => targetWindow.webContents.send('devTools', 'secondary')
        }));
        menu.items[2].submenu.insert(5, new electron_1.MenuItem({ type: 'separator' }));
    }
    return menu;
};
//# sourceMappingURL=menubar.js.map