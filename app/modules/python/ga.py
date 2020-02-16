import time
import threading
import json
import random
import sys
import importlib
import types


class Population:
    """
    Population that has possible solutions
    """

    def __init__(self, pop_size: int, genes_num: int):
        self.individuals = [Individual(genes_num=genes_num) for _ in range(pop_size)]
        self.pop_size = pop_size
        self.genes_num = genes_num

        # generation set to 0 for every new population
        self.generation = 0

    def fittest(self):
        """
        get fittest individual
        """
        fittest_ind = self.individuals[0]
        for ind in self.individuals[1:]:
            if fittest_ind.fitness() < ind.fitness():
                fittest_ind = ind
        return fittest_ind


class Individual:
    """
    Individual of a population, can be instantiated by passing genes to 
    the constructor or optional genes number
    """

    def __init__(self, genes_num, genes=None):
        if genes:
            self.genes = [int(gene) for gene in genes]
        else:
            # rand 0s and 1s list
            self.genes = [1 if random.random() >= .5 else 0 for _ in range(genes_num)]

    # call genes_fitness if possible
    def fitness(self) -> int:
        return Individual.genes_fitness(self.genes)

    @staticmethod
    def genes_fitness(genes) -> int:
        return sum(1 for ind_gene, solu_gene in zip(genes, solution.genes) if int(ind_gene) == solu_gene)

    def replace_genes(self, genes):
        self.genes = [int(gene) for gene in genes]
        return self


class Evolve:
    @staticmethod
    def to_couples(pop_inds: list, pop_size: int) -> list:
        parents = []
        for _ in range(pop_size // 2):
            couple = [pop_inds.pop(random.randrange(0, len(pop_inds))) for _ in range(2)]
            parents.append(couple)
        return parents

    @staticmethod
    def crossover(parents: list, point: int) -> list:
        offsprings = []
        for couple in parents:
            offspring1 = couple[0].genes[: point]
            offspring1.extend(couple[1].genes[point:])
            offspring2 = couple[1].genes[: point]
            offspring2.extend(couple[0].genes[point:])
            offsprings.append([offspring1, offspring2])
        return offsprings

    @staticmethod
    def mutate(offsprings: list, genes_num: int, mutation_rate: float) -> list:
        for couple in offsprings:
            for offspring in couple:
                for index in range(genes_num):
                    if random.randint(0, 999)/1000 < mutation_rate:
                        offspring[index] = 0 if offspring[index] else 1
        return offsprings

    @staticmethod
    def update_population(parents: list, offsprings: list):
        for parent_couple, offspring_couple in zip(parents, offsprings):
            for parent, offspring in zip(parent_couple, offspring_couple):
                # if parent.fitness() < Individual.genes_fitness(offspring):
                    parent.replace_genes(offspring)

    @staticmethod
    def evolve_population(pop: Population):
        # copy of same individuals to apply selection on it
        pop_inds = pop.individuals.copy()
        # list of couples to apply cross over on them
        parents = Evolve.to_couples(pop_inds, pop.pop_size)
        # defined here to avoid crossover_rate being changed
        # by user on the cross over process.
        crossover_point = int(g_crossover_rate * pop.genes_num)
        # list of couples of offsprings.
        offsprings = Evolve.crossover(parents, crossover_point)
        # list of couples of offsprings, mutation_rate is passed here
        # to avoid being changed by user on the mutation process.
        offsprings = Evolve.mutate(offsprings, pop.genes_num, g_mutation_rate)
        # parents and offsprings are sorted
        Evolve.update_population(parents, offsprings)
        # finished generating the next generation
        pop.generation += 1


class GAThread(threading.Thread):
    """
    separate thread to run Genetic Algorithm while not blocking
    the main thread.
    """

    def __init__(self):
        threading.Thread.__init__(self)
        # flag if start method has been called
        self.start_triggered = False
        # thread pause condition
        self.pause_cond = threading.Condition(threading.Lock())
        # flag to pause thread
        self.__pause_now = False
        # flag to state thread state
        self.paused = True
        # flag to stop thread
        self.__stop_now = False

    def run(self):
        # initializing the population
        pop = Population(g_pop_size, len(solution.genes))
        # fittest fitness of the previous generation, used to send deviation value
        prvFitness = pop.fittest().fitness()

        # started signal to the renderer process
        to_json({
            "started": True,
            "first-step": self.__pause_now,
            "genesNum": pop.genes_num,
            "fitness": prvFitness,
        })
        
        # first generated solutions (generation 0)
        to_json({
            "fitness": prvFitness,
            "generation": pop.generation,
            "genes": pop.fittest().genes
        })

        while True:
            Evolve.evolve_population(pop)

            # takes the current generation fitness
            curFitness = pop.fittest().fitness()

            # if g_delay_rate is 0 than just ignore it
            if g_delay_rate:
                time.sleep(g_delay_rate)

            # pause check, moved down to avoid another iteration if stop event
            # was triggered after a pause event
            self.__pause_check()

            # stopped event, seperating finished naturally (if there is valid
            # solution) from being forcefully stopped
            if self.__stop_now:
                to_json({"stopped": True})
                return

            # moved down, so when GA is heavy (slow), user might stop it before the point is added
            # the point must not be added, so ga stops before executing below code
            to_json({
                "prv-fitness": prvFitness,
                "fitness": curFitness,
                "generation": pop.generation,
                "genes": pop.fittest().genes,
                # "deviation": abs(curFitness - prvFitness),
                # "min": min(prvFitness, curFitness)
            })

            # update prvFitness
            prvFitness = curFitness

        # finished event
        to_json({"finished": True})


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

    def start(self):
        """
        starts thread activity if start method was not called
        before on this thread
        """
        if not self.start_triggered:
            self.start_triggered = True
            self.paused = False
            threading.Thread.start(self)

    def pause(self):
        """
        pause thread if running
        """
        # thread should be running to pause
        if not self.paused:
            self.__pause_now = True
            # notify app of the pause
            to_json({
                "paused": True
            })

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
            # notify app
            to_json({
                "resumed": True
            })
        # user triggered pause (through play button) through GUI and self.paused is still false means
        # GA is too slow on generating the next generation, than when the user clicked play (for resume)
        # it just turns self.__pause_now to false to prevent GA from pausing.
        elif self.__pause_now: self.__pause_now = False

    def step_forward(self):
        """
        move one iteration forward
        """
        # start it if not started yet
        if not self.start_triggered:
            self.start_triggered = True
            self.__pause_now = True
            # fixes the blocking that happens when user clicks step_f multiple times on a heavy GA
            self.paused = False
            threading.Thread.start(self)
            return
        # release if paused, it will lock automatically after one generation
        # because __pause_now is set to True
        elif not self.paused:
            self.__pause_now = True
            to_json({
                "paused": True
            })
        elif not self.__pause_now:
            # Notify so thread will wake after lock released
            self.pause_cond.notify()
            # Now release the lock
            self.pause_cond.release()
            # pause now
            self.paused = False
            self.__pause_now = True

    def stop(self):
        """
        if thread is alive, terminate it
        """
        if self.is_alive():
            self.__stop_now = True
            # resume if paused to break out of running loop
            if self.paused:
                # Notify so thread will wake after lock released
                self.pause_cond.notify()
                # Now release the lock
                self.pause_cond.release()
                self.paused = False
            # in case is going to pause but user pressed stop, GA should pass the pause check test to stop
            else: self.__pause_now = False
            self.join()


def to_json(word: dict):
    """ prints a dict to json and flush it for instant respond (doesn't buffer output)
    """
    print(json.dumps(word), flush=True)

""" dsddsds """
fitness_module = None

# initialized when user sends play, replay or step_f signal if it's first step forward
ga_thread = None
solution = None

# global settings, changed every time user passes them
g_crossover_rate = .5
g_mutation_rate = .06
g_delay_rate = 0

# initialized every time GA is initialized,
# if user passes them after GA started it will do nothing
g_pop_size = int(sys.argv[1]) if len(sys.argv) > 1 else random.randint(1, 500)
g_genes_num = int(sys.argv[2]) if len(sys.argv) > 2 else random.randint(1, 200)
g_delay_rate = int(sys.argv[3]) if len(sys.argv) > 3 else g_delay_rate

def final_value(min_val, given_val, is_random: bool):
    """ called when a signal is received, if random flag set to True it will return
    value between min_val and given_val, else it returns given_val 
    """
    if is_random:
        # detects whether should calculate int or float through min_val type
        return random.randint(min_val, given_val) if (type(min_val) == int) else random.uniform(min_val, given_val)
    return given_val

def setup(command: dict):
    pass



def update_parameters(command: dict):
    """ check crossover & mutation rate new updates and apply them
    """
    global g_pop_size
    global g_genes_num
    global g_crossover_rate
    global g_mutation_rate
    global g_delay_rate
    if command.get('pop_size'):
        # population size
        g_pop_size = final_value(1, command.get('pop_size'), command.get('random_pop_size'))
    if command.get('genes_num'):
        # genes number
        g_genes_num = final_value(1, command.get('genes_num'), command.get('random_genes_num'))
    if command.get('crossover_rate'):
        # crossover rate change, it should not be 0
        g_crossover_rate = round(final_value(.001, command.get('crossover_rate'), command.get('random_crossover_rate')), 3)
    if type(command.get('mutation_rate')) is not type(None):
        # mutation rate change, can be 0
        g_mutation_rate = round(final_value(.0, command.get('mutation_rate'), command.get('random_mutation_rate')), 3)
    if type(command.get('delay_rate')) is not type(None):
        # sleep in seconds
        g_delay_rate = round(final_value(.0, command.get('delay_rate'), command.get('random_delay_rate')), 2)
    # to_json({
    #     "pop": g_pop_size,
    #     "rnPop": command.get('random_pop_size'),
    #     "genes": g_genes_num,
    #     "rnGenes": command.get('random_genes_num'),
    #     "crossover": g_crossover_rate,
    #     "rnCO": command.get('random_crossover_rate'),
    #     "mutation": g_mutation_rate,
    #     "rnMut": command.get('random_mutation_rate'),
    #     "delay": g_delay_rate,
    #     "rnDelay": command.get('random_delay_rate')
    # })


def init_ga():
    """ Initialize new GA thread with a new solution
     """
    global ga_thread
    ga_thread = GAThread()
    # initialize solution
    global solution
    solution = Individual(genes_num=g_genes_num)


# possible to add condition here in near future
while True:
    # read a command
    cmd = input()
    if cmd == 'play':
        if ga_thread is not None and ga_thread.is_alive():
            ga_thread.resume()
        else:
            init_ga()
            ga_thread.start()
    elif cmd == 'pause':
        if ga_thread is not None and ga_thread.is_alive():
            ga_thread.pause()
    elif cmd == 'stop':
        if ga_thread is not None:
            ga_thread.stop()
    elif cmd == 'replay':
        if ga_thread is not None:
            ga_thread.stop()
        init_ga()
        ga_thread.start()
    elif cmd == 'step_f':
        if ga_thread is None or not ga_thread.is_alive():
            init_ga()
        ga_thread.step_forward()
    elif cmd == 'exit':
        if ga_thread is not None:
            ga_thread.stop()
        sys.exit(0)
    else:
        try:
            load = json.loads(cmd)
        except:
            pass
        else:
            update_parameters(load)

