import { ChildProcess } from 'child_process';
import { WebviewTag, WebFrame } from 'electron';

module.exports = (
  pyshell: ChildProcess,
  prime: WebviewTag,
  side: WebviewTag,
  treatResponse: (response: object) => void,
  webFrame: WebFrame
) => {
  // open communication
  pyshell.stdout.on('data', (response: Buffer) => {
    prime.send('data', response);
    side.send('data', response);
    response
      .toString()
      .split(/(?<=\n)/)
      .forEach((args: string) => treatResponse(JSON.parse(args)));
  });
  // returns webviews zoom factor resetter.
  return () => {
    prime.setZoomFactor(webFrame.getZoomFactor());
    side.setZoomFactor(webFrame.getZoomFactor());
  };
};
