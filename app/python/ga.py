# import time
import threading
import json
import random
import sys


class Population:
    """
    Population that has possible solutions
    """

    def __init__(self, pop_size: int = 200, genes_num: int = 120):
        self.individuals = [Individual(genes_num=genes_num) for _ in range(pop_size)]
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
    the constructor or optional genes number, default is 120 genes.
    """

    def __init__(self, genes=None, genes_num: int = 120):
        if genes:
            self.genes = [int(gene) for gene in genes]
        else:
            # rand 0s and 1s list
            self.genes = [1 if random.random() >= .5 else 0 for _ in range(genes_num)]

    def fitness(self) -> int:
        return sum(1
                   for ind_gene, solu_gene in zip(self.genes, solution.genes)
                   if ind_gene == solu_gene
                   )

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
    def cross_over(parents: list, point: int) -> list:
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
                    if random.random() <= mutation_rate:
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
        parents = Evolve.to_couples(pop_inds, len(pop.individuals))
        # defined here to avoid cross_over_rate being changed
        # by user on the cross over process.
        cross_over_point = int(g_cross_over_rate * pop.genes_num)
        # list of couples of offsprings.
        offsprings = Evolve.cross_over(parents, cross_over_point)
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
        self.paused = False
        # flag to stop thread
        self.__stop_now = False

    def run(self):
        to_json({
            "started": True
        })
        pop = Population()

        # check before entering evolution loop if pause event
        #  was fired before hitting start
        self.__pause_check()
        to_json({
            "fitness": pop.fittest().fitness(),
            "generation": 0
        })
        while not self.__stop_now:
            Evolve.evolve_population(pop)
            to_json({
                "fitness": pop.fittest().fitness(),
                "generation": pop.generation
            })
            # time.sleep(.1)

            # pause check, moved down to avoid another iteration if stop event
            # was triggered after a pause event
            self.__pause_check()

        # finished event

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
            # resume if paused to break out of running loop
            self.resume()
            self.join()


# prints a dict to json
def to_json(word: dict):
    print(json.dumps(word))


if len(sys.argv) > 1:
    solution = Individual(genes=sys.argv[1])
else:
    # add genes number can be adjusted
    solution = Individual()

# change to be passed by renderer process
# global settings
g_cross_over_rate = .5
g_mutation_rate = .06

ga_thread = None

while True:
    cmd = json.loads(input())
    # TODO add else for cmd cases if ga_thread is None
    if cmd == 'play':
        if ga_thread is not None:
            if ga_thread.is_alive():
                ga_thread.resume()
            else:
                ga_thread = GAThread()
                ga_thread.start()
        else:
            ga_thread = GAThread()
            ga_thread.start()
    elif cmd == 'pause':
        if ga_thread is not None:
            ga_thread.pause()
    elif cmd == 'step_f':
        if ga_thread is not None:
            ga_thread.step_forward()
    elif cmd == 'stop':
        if ga_thread is not None:
            ga_thread.stop()
    elif cmd == 'state':
        print(ga_thread.is_alive())
