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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudWJhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1lbnViYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSx1Q0FBNEQ7QUFFNUQsSUFBSSxRQUFzQyxDQUFDO0FBRTNDLENBQUMsR0FBRyxFQUFFO0lBQ0osTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLFFBQVEsSUFBSSxRQUFRLENBQUM7SUFDM0MsUUFBUSxHQUFHO1FBRVQsR0FBRyxDQUFDLEtBQUs7WUFDUCxDQUFDLENBQUU7Z0JBQ0M7b0JBQ0UsS0FBSyxFQUFFLFlBQVk7b0JBQ25CLE9BQU8sRUFBRTt3QkFDUCxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUU7d0JBQ2pCLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRTt3QkFDckIsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFO3dCQUNwQixFQUFFLElBQUksRUFBRSxXQUFXLEVBQUU7d0JBQ3JCLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRTt3QkFDaEIsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFO3dCQUN0QixFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7d0JBQ2xCLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRTt3QkFDckIsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFO3FCQUNqQjtpQkFDRjthQUMrQjtZQUNwQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBRVA7WUFDRSxLQUFLLEVBQUUsT0FBTztZQUNkLE9BQU8sRUFBRTtnQkFDUCxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUU7YUFDYjtTQUNsQztRQUVEO1lBQ0UsS0FBSyxFQUFFLE9BQU87WUFDZCxPQUFPLEVBQUU7Z0JBQ1AsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFO2dCQUNoQixFQUFFLElBQUksRUFBRSxNQUFNLEVBQUU7Z0JBQ2hCLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRTtnQkFDckIsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFO2dCQUNmLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRTtnQkFDaEIsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFO2dCQUNqQixHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFBSSxRQUFRO29CQUM5QixDQUFDLENBQUM7d0JBQ0UsRUFBRSxJQUFJLEVBQUUsb0JBQW9CLEVBQUU7d0JBQzlCLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTt3QkFDbEIsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFO3dCQUNyQixFQUFFLElBQUksRUFBRSxXQUFXLEVBQUU7d0JBQ3JCOzRCQUNFLEtBQUssRUFBRSxTQUFTOzRCQUNoQixPQUFPLEVBQUU7Z0NBQ1AsRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFO2dDQUN6QixFQUFFLElBQUksRUFBRSxjQUFjLEVBQUU7NkJBQ0s7eUJBQ2hDO3FCQUNGO29CQUNILENBQUMsQ0FBRTt3QkFDQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7d0JBQ2xCLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRTt3QkFDckIsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFO3FCQUNXLENBQUM7YUFDUjtTQUNsQztRQUVEO1lBQ0UsS0FBSyxFQUFFLE9BQU87WUFDZCxPQUFPLEVBQUU7Z0JBQ1AsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFO2dCQUNsQixFQUFFLElBQUksRUFBRSxhQUFhLEVBQUU7Z0JBQ3ZCLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFFO2dCQUMxQixFQUFFLElBQUksRUFBRSxXQUFXLEVBQUU7Z0JBQ3JCLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRTtnQkFDckIsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFO2dCQUNsQixFQUFFLElBQUksRUFBRSxTQUFTLEVBQUU7Z0JBQ25CLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRTtnQkFDckIsRUFBRSxJQUFJLEVBQUUsa0JBQWtCLEVBQUU7YUFDRztTQUNsQztRQUVEO1lBQ0UsS0FBSyxFQUFFLFNBQVM7WUFDaEIsT0FBTyxFQUFFO2dCQUNQLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRTtnQkFDcEIsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFO2dCQUNoQixHQUFHLENBQUMsS0FBSztvQkFDUCxDQUFDLENBQUM7d0JBQ0UsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFO3dCQUNyQixFQUFFLElBQUksRUFBRSxPQUFPLEVBQUU7d0JBQ2pCLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRTt3QkFDckIsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFO3FCQUNuQjtvQkFDSCxDQUFDLENBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBa0MsQ0FBQzthQUMzQjtTQUNsQztRQUNEO1lBQ0UsS0FBSyxFQUFFLE9BQU87WUFDZCxJQUFJLEVBQUUsTUFBTTtZQUNaLE9BQU8sRUFBRTtnQkFDUDtvQkFDRSxLQUFLLEVBQUUsYUFBYTtvQkFDcEIsS0FBSyxFQUFFLEdBQVMsRUFBRTt3QkFDaEIsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzt3QkFDdEMsTUFBTSxLQUFLLENBQUMsWUFBWSxDQUFDLHdCQUF3QixDQUFDLENBQUM7b0JBQ3JELENBQUMsQ0FBQTtpQkFDRjthQUM4QjtTQUNsQztLQUNGLENBQUM7QUFDSixDQUFDLENBQUMsRUFBRSxDQUFDO0FBRUwsTUFBTSxDQUFDLE9BQU8sR0FBRyxlQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUMifQ==