"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
let template;
(() => {
    const isMac = process.platform == 'darwin';
    template = [
        ...(isMac
            ? [
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
            ]
            : []),
        {
            label: '&File',
            submenu: [
                isMac ? { role: 'close' } : { role: 'quit' }
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
                            ]
                        }
                    ]
                    : [
                        { role: 'delete' },
                        { type: 'separator' },
                        { role: 'selectAll' }
                    ])
            ]
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
            ]
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
                    : [{ role: 'close' }])
            ]
        },
        {
            label: '&help',
            role: 'help',
            submenu: [
                {
                    label: '&Learn More',
                    click: () => __awaiter(void 0, void 0, void 0, function* () {
                        const { shell } = require('electron');
                        yield shell.openExternal('https://electronjs.org');
                    })
                }
            ]
        }
    ];
})();
module.exports = electron_1.Menu.buildFromTemplate(template);
//# sourceMappingURL=menubar.js.map