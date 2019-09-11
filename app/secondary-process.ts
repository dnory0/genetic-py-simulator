/**
 * this process is for the timer and the cpuusage recorder,
 * first:
 *  fork this process, by default the timer does not launch after
 *    forking this process.
 * second:
 *  to start the timer send 'start' message from parent process to this process,
 *  to pause the timer send 'pause' message from parent process to this process,
 *  to resume the timer send 'resume' message from parent process to this process,
 *  to stop the timer send 'stop' message from parent process to this process,
 *  note: the process sends time to parrent process in hh:mm:ss:µµ format every .07s,
 */

import * as os from 'os-utils';

// is initiated when user launch CGA and it's triggered every .07s
let timeChecker: NodeJS.Timeout;
// holds timerid after calling startTimeCalc() when user launch CGA
let timer = null;
// holds exact time passed after `timer` was initiated everytime timeChecker is triggered
let tempTimer = null;
// initialized whenever the user pause the CGA
let pauseTimer = null;
// holds the time that user kept play/pause button state at pause (accumulated)
let accPauseTimer = [0, 0];
// controls whether it should send time or not, turned true if the CGA is running
// else it's false
let sendTime = true;

/**
 * initialize timer to start calculation time, initialize timeChecker to
 * send time value every to parentProcess every .07s
 */
function startTimeCalc() {
  timer = process.hrtime();
  timeChecker = setInterval(() => {
    if (!sendTime) return;
    tempTimer = process.hrtime(timer);
    tempTimer = [
      tempTimer[1] - accPauseTimer[1] < 0
        ? tempTimer[0] - accPauseTimer[0] - 1
        : tempTimer[0] - accPauseTimer[0],
      tempTimer[1] - accPauseTimer[1] < 0
        ? tempTimer[1] + 1000000000 - accPauseTimer[1]
        : tempTimer[1] - accPauseTimer[1]
    ];
    process.send(
      `time: ${
        Math.trunc(tempTimer[0] / 3600) < 10
          ? `0${Math.trunc(tempTimer[0] / 3600)}`
          : `${Math.trunc(tempTimer[0] / 3600)}`
      }:${
        Math.trunc((tempTimer[0] % 3600) / 60) < 10
          ? `0${Math.trunc((tempTimer[0] % 3600) / 60)}`
          : `${Math.trunc((tempTimer[0] % 3600) / 60)}`
      }:${
        tempTimer[0] % 60 < 10
          ? `0${tempTimer[0] % 60}`
          : `${tempTimer[0] % 60}`
      }:${
        tempTimer[1] < 100000000
          ? `0${Math.trunc(tempTimer[1] / 10000000)}`
          : `${Math.trunc(tempTimer[1] / 10000000)}`
      }`
    );
  }, 70);
}

/**
 * stop sending time to parentProcess, initialize pauseTimer to start calculation
 * of the pause state time
 */
function pauseTimeCalc() {
  sendTime = false;
  pauseTimer = process.hrtime();
}

/**
 * calc paused time and adds it the accumulated pause time, and resume sending time
 */
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

/**
 * clears timeChecker to stop sending time to parentProcess,
 * initialize global variables, and sends parentProcess time-finished event
 */
function finishTimeCalc() {
  if (timeChecker) clearInterval(timeChecker);
  process.send('time-finished');
  pauseTimer = null;
  accPauseTimer = [0, 0];
  sendTime = true;
}

// sends CPU Usage to parentProcess every 1sec
setInterval(
  () =>
    os.cpuUsage((v: number) => {
      process.send(
        `cpuusage: ${
          v < 0.1 ? `0${Math.trunc(v * 100)}` : `${Math.trunc(v * 100)}`
        }`
      );
    }),
  1000
);

// handles channel requests to start, pause, resume or stop the timer.
process.on('message', (message: string) => {
  if (message.includes('start')) startTimeCalc();
  else if (message.includes('pause')) pauseTimeCalc();
  else if (message.includes('resume')) resumeTimeCalc();
  else if (message.includes('finish')) finishTimeCalc();
});
