import { MenuItemConstructorOptions, Menu } from 'electron';

let template: MenuItemConstructorOptions[];

(() => {
  const isMac = process.platform == 'darwin';
  template = [
    // { role: 'appMenu' }
    ...(isMac
      ? ([
          {
            label: '&GeneticPy',
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
    // { role: 'fileMenu' }
    {
      label: '&File',
      submenu: [
        isMac ? { role: 'close' } : { role: 'quit' }
      ] as MenuItemConstructorOptions[]
    },
    // { role: 'editMenu' }
    {
      label: '&Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(process.platform == 'darwin'
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
    // { role: 'viewMenu' }
    {
      label: '&View',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ] as MenuItemConstructorOptions[]
    },
    // { role: 'windowMenu' }
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
