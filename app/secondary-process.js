let timeChecker;
let timer = null;
let tempTimer = null;
let pauseTimer = null;
let accPauseTimer = [0, 0];
let sendTime = true;
function startTimeCalc() {
    timer = process.hrtime();
    timeChecker = setInterval(() => {
        if (!sendTime)
            return;
        tempTimer = process.hrtime(timer);
        tempTimer = [
            tempTimer[1] - accPauseTimer[1] < 0
                ? tempTimer[0] - accPauseTimer[0] - 1
                : tempTimer[0] - accPauseTimer[0],
            tempTimer[1] - accPauseTimer[1] < 0
                ? tempTimer[1] + 1000000000 - accPauseTimer[1]
                : tempTimer[1] - accPauseTimer[1]
        ];
        process.send(`time: ${Math.trunc(tempTimer[0] / 3600) < 10
            ? `0${Math.trunc(tempTimer[0] / 3600)}`
            : `${Math.trunc(tempTimer[0] / 3600)}`}:${Math.trunc((tempTimer[0] % 3600) / 60) < 10
            ? `0${Math.trunc((tempTimer[0] % 3600) / 60)}`
            : `${Math.trunc((tempTimer[0] % 3600) / 60)}`}:${tempTimer[0] % 60 < 10
            ? `0${tempTimer[0] % 60}`
            : `${tempTimer[0] % 60}`}:${tempTimer[1] < 100000000
            ? `0${Math.trunc(tempTimer[1] / 10000000)}`
            : `${Math.trunc(tempTimer[1] / 10000000)}`}`);
    }, 70);
}
function pauseTimeCalc() {
    sendTime = false;
    pauseTimer = process.hrtime();
}
function resumeTimeCalc() {
    pauseTimer = process.hrtime(pauseTimer);
    accPauseTimer = [
        1000000000 <= accPauseTimer[1] + pauseTimer[1]
            ? accPauseTimer[0] + pauseTimer[0] + 1
            : accPauseTimer[0] + pauseTimer[0],
        1000000000 < accPauseTimer[1] + pauseTimer[1]
            ? accPauseTimer[1] + pauseTimer[1] - 1000000000
            : accPauseTimer[1] + pauseTimer[1]
    ];
    sendTime = true;
}
function finishTimeCalc() {
    if (timeChecker)
        clearInterval(timeChecker);
    process.send('time-finished');
    pauseTimer = null;
    accPauseTimer = [0, 0];
    sendTime = true;
}
process.on('message', (message) => {
    if (message.includes('start'))
        startTimeCalc();
    else if (message.includes('pause'))
        pauseTimeCalc();
    else if (message.includes('resume'))
        resumeTimeCalc();
    else if (message.includes('finish'))
        finishTimeCalc();
});
//# sourceMappingURL=secondary-process.js.map