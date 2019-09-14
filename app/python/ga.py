import time
import threading


class GAThread(threading.Thread):
    """
    seperate thread to run Genetic Algorithm while not blocking
    the main thread.
    """

    def __init__(self):
        threading.Thread.__init__(self)
        # thread pause condition
        self.pause_cond = threading.Condition(threading.Lock())
        # flag to pause thread
        self.__pause_now = False
        # flag to state thread state
        self.paused = False
        # flag to stop thread
        self.__stop_now = False

    def run(self):
        while not self.__stop_now:
            # pause if pause() is called
            if self.__pause_now:
                # halt
                self.pause_cond.acquire()
                self.__pause_now = False
                self.paused = True
            print(self.__stop_now)

            with self.pause_cond:
                while self.paused:
                    self.pause_cond.wait()

            # added work
            time.sleep(0.01)
        print("stopped")

    def pause(self):
        """
        pause thread if running
        """
        # thread should be running to pause
        if not self.paused:
            self.__pause_now = True

    # should just resume the thread
    def resume(self):
        """
        resume thread if paused
        """
        # thread should be paused to resume
        if self.paused:
            # Notify so thread will wake after lock released
            self.pause_cond.notify()
            # Now release the lock
            self.pause_cond.release()
            self.paused = False

    def step_forward(self):
        """
        move one iteration forward
        """
        self.resume()
        self.pause()

    def stop(self):
        self.__stop_now = True
        # resume if paused to break out of loop
        self.resume()
        self.join()


ga_thread = GAThread()
ga_thread.start()
while True:
    state = input()
    if state == 'pause':
        print(state)
        ga_thread.pause()
    elif state == 'resume':
        ga_thread.resume()
    elif state == 'next':
        ga_thread.step_forward()
    elif state == 'stop':
        ga_thread.stop()
        break
    elif state == 'state':
        print(ga_thread.is_alive())
    else:
        print('wrong command')
