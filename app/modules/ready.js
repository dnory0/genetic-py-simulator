"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = (pyshell, prime, side, treatResponse, webFrame) => {
    pyshell.stdout.on('data', (response) => {
        response
            .toString()
            .split(/(?<=\n)/g)
            .map((data) => JSON.parse(data))
            .forEach((data) => {
            prime.send('data', data);
            side.send('data', data);
            treatResponse(data);
        });
    });
    return () => {
        prime.setZoomFactor(webFrame.getZoomFactor());
        side.setZoomFactor(webFrame.getZoomFactor());
    };
};
//# sourceMappingURL=ready.js.map