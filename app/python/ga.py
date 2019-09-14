import time
import threading
import json
import random

# class Population:
#     def __init__(self, pop_size: int = 100, genes_len: int):
#         self.generation = 0
        
class Individual:
    def __init__(self, genes: list = None, genes_length: int = 64):
        self.genes = [int(gene) for gene in genes]

    def fitness(self, solution) -> int:
        return sum(1
            for ind_gene, solu_gene in zip(self.genes, solution.genes)
            if ind_gene == solu_gene
        )

    
class GAThread(threading.Thread):
    """
    seperate thread to run Genetic Algorithm while not blocking
    the main thread.
    """
    def __init__(self, solution: Individual = []):
        threading.Thread.__init__(self)
        # flag if start method has been called
        self.start_triggered = False
        # thread pause condition
        self.pause_cond = threading.Condition(threading.Lock())
        # flag to pause thread
        self.__pause_now = False
        # flag to state thread state
        self.paused = False
        # flag to stop thread
        self.__stop_now = False
        # temp: solution can be ungiven
        self.solution = solution

    def __pause_check(self):
        """
        pause if pause() is called
        """
        if self.__pause_now:
            # halt
            self.pause_cond.acquire()
            self.__pause_now = False
            self.paused = True
        
        with self.pause_cond:
            while self.paused:
                self.pause_cond.wait()

    def run(self):
        # check before entering evolution loop
        self.__pause_check()
        while not self.__stop_now:
            # print(Individual([1, 2, int(1 if random.random() >= .5 else 0)]).fitness(self.solution))
            print("hi")
            time.sleep(.1)

            # pause check
            self.__pause_check()

    def start(self):
        if not self.is_alive() and not self.start_triggered:
            self.start_triggered = True
            threading.Thread.start(self)

    def pause(self):
        """
        pause thread if running
        """
        # thread should be running to pause
        # if not self.paused:
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
        """
        if thread is alive, terminate it
        """
        if self.is_alive():
            self.__stop_now = True
            # resume if paused to break out of loop
            self.resume()
            self.join()


ga_thread = GAThread()
while True:
    cmd = input()

    if cmd == 'start':
        ga_thread.start()
    elif cmd == 'pause':
        ga_thread.pause()
    elif cmd == 'resume':
        ga_thread.resume()
    elif cmd == 'next':
        ga_thread.step_forward()
    elif cmd == 'stop':
        ga_thread.stop()
    elif cmd == 'rebuild':
        ga_thread.stop()
        ga_thread = GAThread()
    elif cmd == 'state':
        print(ga_thread.is_alive())
    else:
        print('wrong command')
