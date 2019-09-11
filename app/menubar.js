"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
                { role: 'reload' },
                { role: 'forcereload' },
                { role: 'toggledevtools' },
                { type: 'separator' },
                { role: 'resetzoom' },
                { role: 'zoomin' },
                { role: 'zoomout' },
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
                    click: () => __awaiter(this, void 0, void 0, function* () {
                        const { shell } = require('electron');
                        yield shell.openExternal('https://electronjs.org');
                    })
                }
            ]
        }
    ];
})();
module.exports = electron_1.Menu.buildFromTemplate(template);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudWJhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1lbnViYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLHVDQUE0RDtBQUU1RCxJQUFJLFFBQXNDLENBQUM7QUFFM0MsQ0FBQyxHQUFHLEVBQUU7SUFDSixNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQztJQUMzQyxRQUFRLEdBQUc7UUFFVCxHQUFHLENBQUMsS0FBSztZQUNQLENBQUMsQ0FBRTtnQkFDQztvQkFDRSxLQUFLLEVBQUUsWUFBWTtvQkFDbkIsT0FBTyxFQUFFO3dCQUNQLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRTt3QkFDakIsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFO3dCQUNyQixFQUFFLElBQUksRUFBRSxVQUFVLEVBQUU7d0JBQ3BCLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRTt3QkFDckIsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFO3dCQUNoQixFQUFFLElBQUksRUFBRSxZQUFZLEVBQUU7d0JBQ3RCLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTt3QkFDbEIsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFO3dCQUNyQixFQUFFLElBQUksRUFBRSxNQUFNLEVBQUU7cUJBQ2pCO2lCQUNGO2FBQytCO1lBQ3BDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFFUDtZQUNFLEtBQUssRUFBRSxPQUFPO1lBQ2QsT0FBTyxFQUFFO2dCQUNQLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRTthQUNiO1NBQ2xDO1FBRUQ7WUFDRSxLQUFLLEVBQUUsT0FBTztZQUNkLE9BQU8sRUFBRTtnQkFDUCxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUU7Z0JBQ2hCLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRTtnQkFDaEIsRUFBRSxJQUFJ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