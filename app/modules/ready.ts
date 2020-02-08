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
    response
      .toString()
      .split(/(?<=\n)/g)
      .map((data: string) => JSON.parse(data))
      .forEach((data: object) => {
        prime.send('data', data);
        side.send('data', data);
        treatResponse(data);
      });
  });

  // returns webviews zoom factor resetter.
  return () => {
    prime.setZoomFactor(webFrame.getZoomFactor());
    side.setZoomFactor(webFrame.getZoomFactor());
  };
};
