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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var template;
(function () {
    var isMac = process.platform == 'darwin';
    template = __spreadArrays((isMac
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
        : []), [
        {
            label: '&File',
            submenu: [
                isMac ? { role: 'close' } : { role: 'quit' }
            ]
        },
        {
            label: '&Edit',
            submenu: __spreadArrays([
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' }
            ], (process.platform == 'darwin'
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
                ]))
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
            submenu: __spreadArrays([
                { role: 'minimize' },
                { role: 'zoom' }
            ], (isMac
                ? [
                    { type: 'separator' },
                    { role: 'front' },
                    { type: 'separator' },
                    { role: 'window' }
                ]
                : [{ role: 'close' }]))
        },
        {
            label: '&help',
            role: 'help',
            submenu: [
                {
                    label: '&Learn More',
                    click: function () { return __awaiter(void 0, void 0, void 0, function () {
                        var shell;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    shell = require('electron').shell;
                                    return [4, shell.openExternal('https://electronjs.org')];
                                case 1:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    }); }
                }
            ]
        }
    ]);
})();
module.exports = electron_1.Menu.buildFromTemplate(template);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudWJhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1lbnViYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEscUNBQTREO0FBRTVELElBQUksUUFBc0MsQ0FBQztBQUUzQyxDQUFDO0lBQ0MsSUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLFFBQVEsSUFBSSxRQUFRLENBQUM7SUFDM0MsUUFBUSxrQkFFSCxDQUFDLEtBQUs7UUFDUCxDQUFDLENBQUU7WUFDQztnQkFDRSxLQUFLLEVBQUUsWUFBWTtnQkFDbkIsT0FBTyxFQUFFO29CQUNQLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRTtvQkFDakIsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFO29CQUNyQixFQUFFLElBQUksRUFBRSxVQUFVLEVBQUU7b0JBQ3BCLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRTtvQkFDckIsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFO29CQUNoQixFQUFFLElBQUksRUFBRSxZQUFZLEVBQUU7b0JBQ3RCLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTtvQkFDbEIsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFO29CQUNyQixFQUFFLElBQUksRUFBRSxNQUFNLEVBQUU7aUJBQ2pCO2FBQ0Y7U0FDK0I7UUFDcEMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUVQO1lBQ0UsS0FBSyxFQUFFLE9BQU87WUFDZCxPQUFPLEVBQUU7Z0JBQ1AsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFO2FBQ2I7U0FDbEM7UUFFRDtZQUNFLEtBQUssRUFBRSxPQUFPO1lBQ2QsT0FBTyxFQUFFO2dCQUNQLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRTtnQkFDaEIsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFO2dC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