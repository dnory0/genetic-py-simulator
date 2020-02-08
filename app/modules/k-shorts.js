"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function kShorts(prime, side, ipcRenderer) {
    delete require.cache[require.resolve('./k-shorts')];
    const devToolsToggler = (webView) => {
        if (webView == 'prime')
            prime.getWebContents().toggleDevTools();
        else
            side.getWebContents().toggleDevTools();
    };
    ipcRenderer.on('devTools', (_event, webView) => devToolsToggler(webView));
    window.addEventListener('keyup', (event) => {
        if (event.code == 'Backquote' && event.ctrlKey)
            devToolsToggler(event.shiftKey ? 'side' : 'prime');
    }, true);
    prime.addEventListener('ipc-message', (event) => {
        if (event.channel == 'devTools')
            devToolsToggler(event.args);
    });
    side.addEventListener('ipc-message', (event) => {
        if (event.channel == 'devTools')
            devToolsToggler(event.args);
    });
}
module.exports = kShorts;
//# sourceMappingURL=k-shorts.js.map