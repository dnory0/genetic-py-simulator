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
      .forEach((data: object) => treatResponse(data));
  });

  // open error listener, this is logged inside the devTool console
  pyshell.stderr.on('data', (response: Buffer) => {
        console.error(response.toString())
    })

  // returns webviews zoom factor resetter.
  return () => {
    prime.setZoomFactor(webFrame.getZoomFactor());
    side.setZoomFactor(webFrame.getZoomFactor());
  };
};
