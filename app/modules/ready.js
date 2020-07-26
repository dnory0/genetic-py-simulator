"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = (pyshell, prime, side, treatResponse, webFrame) => {
    pyshell.stdout.on('data', (response) => {
        response
            .toString()
            .split(/(?<=\n)/g)
            .map((data) => JSON.parse(data))
            .forEach((data) => console.log(data) || treatResponse(data));
    });
    pyshell.stderr.on('data', (response) => {
        console.error(response.toString());
    });
    return () => {
        prime.setZoomFactor(webFrame.getZoomFactor());
        side.setZoomFactor(webFrame.getZoomFactor());
    };
};
//# sourceMappingURL=ready.js.map