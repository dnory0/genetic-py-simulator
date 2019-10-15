import { MenuItemConstructorOptions, Menu } from 'electron';

let template: MenuItemConstructorOptions[];

(() => {
  const isMac = process.platform == 'darwin';
  template = [
    ...(isMac
      ? ([
          {
            label: '&Genetic Py',
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideothers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' }
            ]
          }
        ] as MenuItemConstructorOptions[])
      : []),
    {
      label: '&File',
      submenu: [
        isMac ? { role: 'close' } : { role: 'quit' }
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
        { role: 'paste' },
        ...(isMac
          ? [
              { role: 'pasteAndMatchStyle' },
              { role: 'delete' },
              { role: 'selectAll' },
              { type: 'separator' },
              {
                label: '&Speech',
                submenu: [
                  { role: 'startspeaking' },
                  { role: 'stopspeaking' }
                ] as MenuItemConstructorOptions
              }
            ]
          : ([
              { role: 'delete' },
              { type: 'separator' },
              { role: 'selectAll' }
            ] as MenuItemConstructorOptions[]))
      ] as MenuItemConstructorOptions[]
    },
    {
      label: '&View',
      submenu: [
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin', accelerator: 'CmdOrCtrl+numadd' },
        { role: 'zoomout', accelerator: 'CmdOrCtrl+numsub' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ] as MenuItemConstructorOptions[]
    },
    {
      label: '&Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? [
              { type: 'separator' },
              { role: 'front' },
              { type: 'separator' },
              { role: 'window' }
            ]
          : ([{ role: 'close' }] as MenuItemConstructorOptions[]))
      ] as MenuItemConstructorOptions[]
    },
    {
      label: '&help',
      role: 'help',
      submenu: [
        {
          label: '&Learn More',
          click: async () => {
            const { shell } = require('electron');
            await shell.openExternal('https://electronjs.org');
          }
        }
      ] as MenuItemConstructorOptions[]
    }
  ];
})();

module.exports = Menu.buildFromTemplate(template);
