from time import sleep
from threading import Thread, Lock, Condition
from json import loads, dumps
from random import random, randint, randrange, uniform
from sys import argv, exit
# from importlib import import_module
# import types


class Population:
    """
    Population that has possible solutions
    """

    def __init__(self, pop_size: int, genes_num: int):
        self.individuals = [
            Individual(genes_num=genes_num) for _ in range(pop_size)
        ]
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
            self.genes = [1 if random() >= .5 else 0 for _ in range(genes_num)]

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
            couple = [
                pop_inds.pop(randrange(0, len(pop_inds))) for _ in range(2)
            ]
            parents.append(couple)
        return parents

    @staticmethod
    def single_point_crossover(parents: list, co_point: int) -> list:
        offsprings = []
        for parent1, parent2 in parents:
            offspring1 = parent1.genes[: co_point]
            offspring1.extend(parent2.genes[co_point:])
            offspring2 = parent2.genes[: co_point]
            offspring2.extend(parent1.genes[co_point:])
            offsprings.append([offspring1, offspring2])
        return offsprings

    @staticmethod
    def two_point_and_k_point_crossover(parents: list, co_point: int, co_point2: int) -> list:
        offsprings = []
        for parent1, parent2 in parents:
            offspring1 = parent1.genes[: co_point]
            offspring1.extend(parent2.genes[co_point:co_point2])
            offspring1.extend(parent1.genes[co_point2:])
            offspring2 = parent2.genes[: co_point]
            offspring2.extend(parent1.genes[co_point:co_point2])
            offspring2.extend(parent2.genes[co_point2:])
            offsprings.append([offspring1, offspring2])
        return offsprings

    @staticmethod
    def uniform_crossover(parents: list) -> list:
        offsprings = []
        for parent1, parent2 in parents:
            offspring1 = [], offspring2 = []
            for gene1, gene2 in zip(parent1.genes, parent2.genes):
                if random() > .5:
                    offspring1.append(gene2)
                    offspring1.append(gene1)
                else:
                    offspring1.append(gene1)
                    offspring1.append(gene2)
        return offsprings

    @staticmethod
    def bit_string_mutation(offsprings: list, genes_num: int, mut_rate: float) -> list:
        for couple in offsprings:
            for offspring in couple:
                for index in range(genes_num):
                    if randint(0, 999)/1000 < mut_rate:
                        offspring[
                            index % len(offspring)
                        ], offspring[
                            (index + 1) % len(offspring)
                        ] = offspring[
                            (index + 1) % len(offspring)
                        ], offspring[
                            index % len(offspring)
                        ]
        return offsprings

    @staticmethod
    def flip_bit_mutation(offsprings: list, genes_num: int, mut_rate: float) -> list:
        for couple in offsprings:
            for offspring in couple:
                for index in range(genes_num):
                    if randint(0, 999)/1000 < mut_rate:
                        offspring[index] = 0 if offspring[index] else 1
        return offsprings

    @staticmethod
    def update_population(parents: list, offsprings: list):
        for parent_couple, offspring_couple in zip(parents, offsprings):
            for parent, offspring in zip(parent_couple, offspring_couple):
                if g_update_pop or parent.fitness() < Individual.genes_fitness(offspring):
                    parent.replace_genes(offspring)

    @staticmethod
    def evolve_population(pop: Population):
        # copy of same individuals to apply selection on it
        pop_inds = pop.individuals.copy()
        # list of couples to apply cross over on them
        parents = Evolve.to_couples(pop_inds, pop.pop_size)
        # defined here to avoid co_rate being changed
        # by user on the cross over process.
        offsprings = []
        if g_co_type == 0:
            co_point = int(g_co_rate * pop.genes_num)
            offsprings = Evolve.single_point_crossover(parents, co_point)
        elif g_co_type == 1:
            g_length = int(g_co_rate * pop.genes_num)
            co_point = (pop.genes_num - g_length)//2
            co_point2 = pop.genes_num - co_point
            offsprings = Evolve.two_point_and_k_point_crossover(
                parents, co_point, co_point2
            )
        else:
            offsprings = Evolve.uniform_crossover(parents)
        # list of couples of offsprings, mut_rate is passed here
        # to avoid being changed by user on the mutation process.
        offsprings = Evolve.bit_string_mutation(
            offsprings, pop.genes_num, g_mut_rate
        ) if g_mut_type == 0 else Evolve.flip_bit_mutation(
            offsprings, pop.genes_num, g_mut_rate
        )
        # parents and offsprings are sorted
        Evolve.update_population(parents, offsprings)
        # finished generating the next generation
        pop.generation += 1


class GAThread(Thread):
    """
    separate thread to run Genetic Algorithm while not blocking
    the main thread.
    """

    def __init__(self):
        Thread.__init__(self)
        # flag if start method has been called
        self.start_triggered = False
        # thread pause condition
        self.pause_cond = Condition(Lock())
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
            "genesNum": pop.genes_num,
            "fitness": prvFitness,
            "first-step": self.__pause_now,
        })

        # first generated solutions (generation 0)
        to_json({
            "generation": pop.generation,
            "genes": pop.fittest().genes,
            "fitness": prvFitness,
        })
        while g_max_gen == False or pop.generation < g_max_gen:
            Evolve.evolve_population(pop)
            # takes the current generation fitness
            curFitness = pop.fittest().fitness()
            # if g_del_rate is 0 or False than just ignore it
            if g_del_rate:
                sleep(g_del_rate)
            if g_pause_gen != False and pop.generation == g_pause_gen + 1:
                self.pause()
                to_json({
                    'forced-pause': True
                })
            # pause check, moved down to avoid another iteration if stop event
            # was triggered after a pause event
            self.__pause_check()
            # stopped event, seperating finished naturally (if there is valid
            # solution) from being forcefully stopped
            if self.__stop_now:
                to_json({
                    "stopped": True
                })
                return
            # moved down, so when GA is heavy (slow), user might stop it before the point is added
            # the point must not be added, so ga stops before executing below code
            to_json({
                "prv-fitness": prvFitness,
                "fitness": curFitness,
                "generation": pop.generation,
                "genes": pop.fittest().genes,
            })
            # update prvFitness
            prvFitness = curFitness

        # finished event
        to_json({
            "finished": True
        })

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
            Thread.start(self)

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
        elif self.__pause_now:
            self.__pause_now = False

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
            Thread.start(self)
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
            else:
                self.__pause_now = False
            self.join()


def to_json(word: dict):
    """ 
    prints a dict to json and flush it for instant respond (doesn't buffer output)
    """
    print(dumps(word), flush=True)


# it's going to hold imported fitness function
fitness_function = None

# initialized when user sends play, replay or step_f signal if it's first step forward
ga_thread = None
solution = None

# default values for the global settings, changes every time user passes them
g_co_rate = .5
g_mut_rate = .06

# initialized every time GA is initialized,
# if user passes them after GA started it will do nothing
g_pop_size = int(argv[1]) if len(argv) > 1 else randint(1, 500)
g_genes_num = int(argv[2]) if len(argv) > 2 else randint(1, 200)
g_del_rate = int(argv[3]) if len(argv) > 3 else 0
g_pause_gen = False
g_max_gen = False
g_co_type = 0
g_mut_type = 0
g_update_pop = 0


def update_parameters(command: dict):
    """
    check crossover & mutation rate new updates and apply them
    """
    global g_pop_size
    global g_genes_num
    global g_co_rate
    global g_co_type
    global g_mut_rate
    global g_mut_type
    global g_del_rate
    global g_pause_gen
    global g_max_gen
    global g_update_pop

    if command.get('pop_size'):
        # population size
        g_pop_size = command.get('pop_size')
    if command.get('genes_num'):
        # genes number
        g_genes_num = command.get('genes_num')
    if command.get('co_rate'):
        # crossover rate change, it should not be 0
        g_co_rate = command.get('co_rate')
    if type(command.get('co_type')) is not type(None):
        # crossover type
        g_co_type = int(command.get('co_type'))
    if type(command.get('mut_rate')) is not type(None):
        # mutation rate change, can be 0
        g_mut_rate = float(command.get('mut_rate'))
    if type(command.get('mut_type')) is not type(None):
        # mutation type
        g_mut_type = int(command.get('mut_type'))
    if type(command.get('del_rate')) is not type(None):
        # sleep in seconds
        g_del_rate = float(command.get('del_rate'))
    if type(command.get('pause_gen')) is not type(None):
        # pause generations
        g_pause_gen = float(command.get('pause_gen'))
    if type(command.get('max_gen')) is not type(None):
        # maximum generations
        g_max_gen = float(command.get('max_gen'))
    if type(command.get('update_pop')) is not type(None):
        # specifies when to update_populatio
        # if 0:
        #   parent is replaced only when offspring fitness is better than parent's
        # else (it equals 1)
        #   parent is always replaced by offspring
        g_update_pop = int(command.get('update_pop'))

    # if command.get('ff'):
    #     import_module(command.get('ff'))


def init_ga():
    """
    Initialize new GA thread with a new solution
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
        exit(0)
    else:
        try:
            load = loads(cmd)
        except:
            pass
        else:
            update_parameters(load)
