"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = (pyshell, prime, side, treatResponse, webFrame) => {
    pyshell.stdout.on('data', (response) => {
        prime.send('data', response);
        side.send('data', response);
        response
            .toString()
            .split(/(?<=\n)/)
            .forEach((args) => treatResponse(JSON.parse(args)));
    });
    return () => {
        prime.setZoomFactor(webFrame.getZoomFactor());
        side.setZoomFactor(webFrame.getZoomFactor());
    };
};
//# sourceMappingURL=ready.js.map