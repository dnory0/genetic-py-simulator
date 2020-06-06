import {
  MenuItemConstructorOptions,
  Menu,
  BrowserWindow,
  MenuItem,
  globalShortcut
} from 'electron';

module.exports = (isDev: boolean, targetWindow: BrowserWindow) => {
  delete require.cache[require.resolve('./menubar')];
  /**
   * zooms in on the renderer process
   */
  const zoomin = () => targetWindow.webContents.send('zoom', 'in');
  /**
   * zooms out on the renderer process
   */
  const zoomout = () => targetWindow.webContents.send('zoom', 'out');
  /**
   * resets zoom to default on the renderer process
   */
  const zoomreset = () => targetWindow.webContents.send('zoom', '');
  /**
   * global menu
   */
  const menu = Menu.buildFromTemplate([
    {
      label: '&File',
      submenu: [
        { role: 'quit', accelerator: 'CmdOrCtrl+Q' },
        { role: 'close', visible: false }
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
        label: 'prime Developer Tools [Ctrl+²]',
        click: () => targetWindow.webContents.send('devTools', 'prime')
      })
    );
    menu.items[2].submenu.insert(
      4,
      new MenuItem({
        label: 'side Developer Tools [Ctrl+Shift+²]',
        click: () => targetWindow.webContents.send('devTools', 'side')
      })
    );
    menu.items[2].submenu.insert(5, new MenuItem({ type: 'separator' }));
  }

  /**
   * add global shortcuts
   */
  globalShortcut.register('CmdOrCtrl+=', zoomin);
  globalShortcut.register('CmdOrCtrl+6', zoomout);
  globalShortcut.register('CmdOrCtrl+0', zoomreset);
  return menu;
};
