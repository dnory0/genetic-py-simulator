import {
  MenuItemConstructorOptions,
  Menu,
  BrowserWindow,
  MenuItem
} from 'electron';

module.exports = (isDev: boolean, targetWindow: BrowserWindow) => {
  const menu = Menu.buildFromTemplate([
    {
      label: '&File',
      submenu: [
        { role: 'quit', accelerator: 'CmdOrCtrl+Q' }
      ] as MenuItemConstructorOptions[]
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
      ] as MenuItemConstructorOptions[]
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
      ] as MenuItemConstructorOptions[]
    }
  ]);
  if (isDev) {
    menu.items[2].submenu.insert(
      2,
      new MenuItem({
        label: 'Main Developer Tools',
        accelerator: 'CmdOrCtrl+Shift+I',
        click: () => targetWindow.webContents.toggleDevTools()
      })
    );
    menu.items[2].submenu.insert(
      3,
      new MenuItem({
        label: 'Primary Developer Tools',
        click: () => targetWindow.webContents.send('devTools', 'primary')
      })
    );
    menu.items[2].submenu.insert(
      4,
      new MenuItem({
        label: 'Secondary Developer Tools',
        click: () => targetWindow.webContents.send('devTools', 'secondary')
      })
    );
    menu.items[2].submenu.insert(5, new MenuItem({ type: 'separator' }));
  }
  return menu;
};
