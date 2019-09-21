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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudWJhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1lbnViYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSx1Q0FBNEQ7QUFFNUQsSUFBSSxRQUFzQyxDQUFDO0FBRTNDLENBQUMsR0FBRyxFQUFFO0lBQ0osTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLFFBQVEsSUFBSSxRQUFRLENBQUM7SUFDM0MsUUFBUSxHQUFHO1FBQ1QsR0FBRyxDQUFDLEtBQUs7WUFDUCxDQUFDLENBQUU7Z0JBQ0M7b0JBQ0UsS0FBSyxFQUFFLFlBQVk7b0JBQ25CLE9BQU8sRUFBRTt3QkFDUCxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUU7d0JBQ2pCLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRTt3QkFDckIsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFO3dCQUNwQixFQUFFLElBQUksRUFBRSxXQUFXLEVBQUU7d0JBQ3JCLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRTt3QkFDaEIsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFO3dCQUN0QixFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7d0JBQ2xCLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRTt3QkFDckIsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFO3FCQUNqQjtpQkFDRjthQUMrQjtZQUNwQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ1A7WUFDRSxLQUFLLEVBQUUsT0FBTztZQUNkLE9BQU8sRUFBRTtnQkFDUCxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUU7YUFDYjtTQUNsQztRQUNEO1lBQ0UsS0FBSyxFQUFFLE9BQU87WUFDZCxPQUFPLEVBQUU7Z0JBQ1AsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFO2dCQUNoQixFQUFFLElBQUksRUFBRSxNQUFNLEVBQUU7Z0JBQ2hCLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRTtnQkFDckIsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFO2dCQUNmLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRTtnQkFDaEIsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFO2dCQUNqQixHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFBSSxRQUFRO29CQUM5QixDQUFDLENBQUM7d0JBQ0UsRUFBRSxJQUFJLEVBQUUsb0JBQW9CLEVBQUU7d0JBQzlCLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTt3QkFDbEIsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFO3dCQUNyQixFQUFFLElBQUksRUFBRSxXQUFXLEVBQUU7d0JBQ3JCOzRCQUNFLEtBQUssRUFBRSxTQUFTOzRCQUNoQixPQUFPLEVBQUU7Z0NBQ1AsRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFO2dDQUN6QixFQUFFLElBQUksRUFBRSxjQUFjLEVBQUU7NkJBQ0s7eUJBQ2hDO3FCQUNGO29CQUNILENBQUMsQ0FBRTt3QkFDQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7d0JBQ2xCLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRTt3QkFDckIsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFO3FCQUNXLENBQUM7YUFDUjtTQUNsQztRQUNEO1lBQ0UsS0FBSyxFQUFFLE9BQU87WUFDZCxPQUFPLEVBQUU7Z0JBQ1AsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7Z0JBQzFCLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRTtnQkFDckIsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFO2dCQUNyQixFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7Z0JBQ2xCLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRTtnQkFDbkIsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFO2dCQUNyQixFQUFFLElBQUksRUFBRSxrQkFBa0IsRUFBRTthQUNHO1NBQ2xDO1FBQ0Q7WUFDRSxLQUFLLEVBQUUsU0FBUztZQUNoQixPQUFPLEVBQUU7Z0JBQ1AsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFO2dCQUNwQixFQUFFLElBQUksRUFBRSxNQUFNLEVBQUU7Z0JBQ2hCLEdBQUcsQ0FBQyxLQUFLO29CQUNQLENBQUMsQ0FBQzt3QkFDRSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUU7d0JBQ3JCLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRTt3QkFDakIsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFO3dCQUNyQixFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7cUJBQ25CO29CQUNILENBQUMsQ0FBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFrQyxDQUFDO2FBQzNCO1NBQ2xDO1FBQ0Q7WUFDRSxLQUFLLEVBQUUsT0FBTztZQUNkLElBQUksRUFBRSxNQUFNO1lBQ1osT0FBTyxFQUFFO2dCQUNQO29CQUNFLEtBQUssRUFBRSxhQUFhO29CQUNwQixLQUFLLEVBQUUsR0FBUyxFQUFFO3dCQUNoQixNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO3dCQUN0QyxNQUFNLEtBQUssQ0FBQyxZQUFZLENBQUMsd0JBQXdCLENBQUMsQ0FBQztvQkFDckQsQ0FBQyxDQUFBO2lCQUNGO2FBQzhCO1NBQ2xDO0tBQ0YsQ0FBQztBQUNKLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFFTCxNQUFNLENBQUMsT0FBTyxHQUFHLGVBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyJ9