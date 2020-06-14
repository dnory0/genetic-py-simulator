import {
  IpcRendererEvent,
  WebviewTag,
  IpcRenderer,
  IpcMessageEvent
} from 'electron';

/**
 * add keyboard shortcuts to toggle prime & side webviews' devTools from renderer process,
 * since the shortcuts can't be impelemented in the main process because of using ```²``` key,
 * also adds listeners to listens to these shortcuts on the webviews
 * @param prime devTools toggled on ```ctrl+²```
 * @param side devTools toggled on ```ctrl+shift+²```
 * @param ipcRenderer to recieve toggle devTools events from menubar's main process
 */
function kShorts(
  prime: WebviewTag,
  side: WebviewTag,
  ipcRenderer: IpcRenderer
) {
  // free module from memory if possible after it finishes
  delete require.cache[require.resolve('./k-shorts')];
  /**
   * toggles devTools for intended webview
   * @param webView prime | side view
   */
  const devToolsToggler = (webView: string) => {
    if (webView == 'prime') prime.getWebContents().toggleDevTools();
    else side.getWebContents().toggleDevTools();
  };
  // listens for main process' menubar
  ipcRenderer.on('devTools', (_event: IpcRendererEvent, webView: string) =>
    devToolsToggler(webView)
  );
  // listens for renderer process
  window.addEventListener(
    'keyup',
    (event: KeyboardEvent) => {
      if (event.code == 'Backquote' && event.ctrlKey)
        devToolsToggler(event.shiftKey ? 'side' : 'prime');
    },
    true
  );
  prime.addEventListener('ipc-message', (event: IpcMessageEvent) => {
    if (event.channel == 'devTools') devToolsToggler(<any>event.args);
  });
  side.addEventListener('ipc-message', (event: IpcMessageEvent) => {
    if (event.channel == 'devTools') devToolsToggler(<any>event.args);
  });
}

module.exports = kShorts;
