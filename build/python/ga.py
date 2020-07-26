#!/bin/python3

from time import sleep
from threading import Thread, Lock, Condition
from json import loads, dumps
from random import random, randint, randrange
from sys import argv, exit, maxsize
from typing import List, Union, Dict
from functools import reduce


# from importlib import import_module


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
            # random 0s and 1s list
            if g_number_of_1s:
                ones_limit = g_number_of_1s
                self.genes = []
                for _ in range(genes_num):
                    self.genes.append(
                        1 if random() >= .5 and ones_limit else 0
                    )
                    if self.genes[-1] == 1:
                        ones_limit -= 1
                to_json({
                    'g_number_of_1s': list(filter(lambda gene: gene == 1, self.genes))
                })
            else:
                self.genes = [
                    1 if random() >= .5 else 0 for _ in range(genes_num)
                ]

    # call genes_fitness if possible
    def fitness(self) -> int:
        return Individual.genes_fitness(self.genes)
        # return Individual.get_fitness(self.genes, g_genes_data)

    # @staticmethod
    # def get_fitness(genes: List[int], data: Union[Dict, List, Tuple, Set]) -> Union[int, float]:
    #     # WARN genes num needs to be multiple of 7
    #     # this stores visited students to monitor students visited, if student is visited twice,
    #     # those genes should get very low value to be eliminated.
    #     visited_students = []
    #     fitness_values = []
    #     # 4 groups
    #     for group_index in range(4):
    #         group_fitness = 0
    #         # each group has 7 students, every student is represented with 5 bits
    #         for student_index in range(7):
    #             student = genes[
    #                       group_index * 35 + student_index * 5:
    #                       group_index * 35 + (student_index + 1) * 5
    #                       ]
    #             if student in visited_students:
    #                 group_fitness += -1000
    #             else:
    #                 visited_students.append(student)
    #                 group_fitness += data.get(
    #                     int(''.join(str(e) for e in student), 2)
    #                 )
    #
    #         fitness_values.append(group_fitness)
    #
    #     if any(group_fitness < 0 for group_fitness in fitness_values):
    #         return int(sum(fitness_values))
    #     else:
    #         return int(sum(fitness_values) / 4 - min(fitness_values))

    # built-in fitness function
    @staticmethod
    def genes_fitness(genes) -> int:
        return sum(1 for ind_gene, solution_gene in zip(genes, solution.genes) if int(ind_gene) == solution_gene)

    def replace_genes(self, genes):
        self.genes = [int(gene) for gene in genes]
        return self


class Evolve:
    @staticmethod
    def random_selection(pop_individuals: List[Individual]) -> list:
        return [
            [
                pop_individuals.pop(randrange(0, len(pop_individuals))) for __ in range(2)
            ] for _ in range(len(pop_individuals) // 2)
        ]

    @staticmethod
    def roulette_wheel_selection(pop_individuals: List[Individual]) -> list:
        parents = []
        roulette_wheel: Dict[Individual, Union[float, int]] = {
            ind: fitness for ind, fitness in zip(pop_individuals, [ind.fitness() for ind in pop_individuals])
        }
        sum_of_fitness = sum(ind.fitness() for ind in pop_individuals)
        for _ in range(len(pop_individuals) // 2):
            couple = []
            for __ in range(2):
                chosen_point = randrange(0, maxsize * 2 + 1) % sum_of_fitness
                for ind in roulette_wheel:
                    if roulette_wheel.get(ind) < chosen_point:
                        chosen_point -= roulette_wheel.get(ind)
                    else:
                        sum_of_fitness -= roulette_wheel.get(ind)
                        couple.append(ind)
                        roulette_wheel.pop(ind)
                        break
            parents.append(couple)
        return parents

    @staticmethod
    def __stochastic_universal_sampling_spinning(
            roulette_wheel: Dict[Individual, Union[int, float]], sum_of_fitness: Union[int, float]
    ) -> list:
        """
        sub-function designed to be only used by stochastic_universal_sampling_selection
        :return: couple of 2 individuals
        """
        couple = []
        chosen_points = [
            randrange(sum_of_fitness // 2 if i == 1 else 0, maxsize * 2 + 1) % sum_of_fitness for i in range(2)
        ]
        for ind in roulette_wheel:
            for chosen_point_index in range(len(chosen_points)):
                if roulette_wheel.get(ind) < chosen_points[chosen_point_index]:
                    # individual is not the chosen one, its fitness value is extracted from the chosen point value
                    chosen_points[chosen_point_index] -= roulette_wheel.get(ind)
                else:
                    # chosen individual is found for ```chosen_point_index``` chosen point
                    if len(couple) and couple[0] is ind:
                        # this is when an individual is selected by both points, the best solution is to repeat rolling
                        return Evolve.__stochastic_universal_sampling_spinning(roulette_wheel, sum_of_fitness)
                    else:
                        # individual is appended to couple
                        couple.append(ind)
                        # after a chosen_point reach the chosen individual it is assigned None and filtered later
                        chosen_points[chosen_point_index] = None
            # the chosen point is assigned None when individual is reached, then filtered before next iteration
            chosen_points = list(filter(lambda chosen_point: not isinstance(chosen_point, type(None)), chosen_points))
            # if couple has been established there is no need to keep iterating through remaining individuals
            if len(couple) == 2:
                break
        return couple

    @staticmethod
    def stochastic_universal_sampling_selection(pop_individuals: List[Individual]) -> list:
        parents = []
        roulette_wheel: Dict[Individual, Union[float, int]] = {
            ind: fitness for ind, fitness in zip(pop_individuals, [ind.fitness() for ind in pop_individuals])
        }
        sum_of_fitness = sum(ind.fitness() for ind in pop_individuals)
        for _ in range(len(pop_individuals) // 2):
            parents.append(Evolve.__stochastic_universal_sampling_spinning(roulette_wheel, sum_of_fitness))
            for ind_of_couple in parents[-1]:
                sum_of_fitness -= roulette_wheel.get(ind_of_couple)
                roulette_wheel.pop(ind_of_couple)
        return parents

    @staticmethod
    def tournament_selection(pop_individuals: List[Individual]) -> list:
        parents = []
        while len(pop_individuals) > 1:
            couple = []
            for _ in range(2):
                # k way number
                k_way = 1 if len(pop_individuals) == 1 else randrange(1, len(pop_individuals))
                # a copy of individuals list is used to select k-way individuals to be able to pop chosen individuals
                selection_individuals = pop_individuals.copy()
                # k-way individuals to select the best out of them
                selected_k_individuals = selection_individuals if len(selection_individuals) == 1 else [
                    selection_individuals.pop(randrange(0, len(selection_individuals))) for _ in range(k_way)
                ]
                couple.append(
                    # selecting the best out of the k-way individuals to append to couple list
                    selected_k_individuals[-1] if len(selected_k_individuals) == 1
                    else reduce(
                        lambda chosen_ind, cur_ind: cur_ind if chosen_ind.fitness() < cur_ind.fitness() else chosen_ind,
                        selected_k_individuals
                    )
                )
                # element is popped of the list after being chosen
                pop_individuals.remove(couple[-1])
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
                    offspring2.append(gene1)
                else:
                    offspring1.append(gene1)
                    offspring2.append(gene2)
        return offsprings

    @staticmethod
    def bit_string_mutation(offsprings: list, genes_num: int, mut_rate: float) -> list:
        for couple in offsprings:
            for offspring in couple:
                for index in range(genes_num):
                    if randint(0, 999) / 1000 < mut_rate:
                        i, j = index % len(
                            offspring), (index + 1) % len(offspring)
                        offspring[i], offspring[j] = offspring[j], offspring[i]
        return offsprings

    @staticmethod
    def flip_bit_mutation(offsprings: list, genes_num: int, mut_rate: float) -> list:
        for couple in offsprings:
            for offspring in couple:
                for index in range(genes_num):
                    if randint(0, 999) / 1000 < mut_rate:
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
        # selection phase: selecting the list of couples of parents
        if g_selection_type == 0:
            parents = Evolve.random_selection(pop.individuals.copy())
        elif g_selection_type == 1:
            parents = Evolve.roulette_wheel_selection(pop.individuals.copy())
        elif g_selection_type == 2:
            parents = Evolve.stochastic_universal_sampling_selection(
                pop.individuals.copy()
            )
        else:
            parents = Evolve.tournament_selection(pop.individuals.copy())

        # defined here to avoid co_rate being changed by user on the crossover process.
        if g_co_type == 0:
            co_point = int(g_co_rate * pop.genes_num)
            offsprings = Evolve.single_point_crossover(parents, co_point)
        elif g_co_type == 1:
            g_length = int(g_co_rate * pop.genes_num)
            co_point = (pop.genes_num - g_length) // 2
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
        prv_fitness = pop.fittest().fitness()

        # started signal to the renderer process
        to_json({
            "started": True,
            "genesNum": pop.genes_num,
            "fitness": prv_fitness,
            "first-step": self.__pause_now,
        })

        # first generated solutions (generation 0)
        to_json({
            "generation": pop.generation,
            "genes": pop.fittest().genes,
            "fitness": prv_fitness,
        })
        while g_max_gen is False or g_max_gen < 0 or pop.generation < g_max_gen:
            Evolve.evolve_population(pop)
            # takes the current generation fitness
            cur_fitness = pop.fittest().fitness()
            # if g_del_rate is 0 or False than just ignore it
            if g_del_rate:
                sleep(g_del_rate)
            if g_pause_gen is not False and pop.generation == g_pause_gen + 1:
                self.pause()
                to_json({
                    'forced-pause': True
                })
            # pause check, moved down to avoid another iteration if stop event
            # was triggered after a pause event
            self.__pause_check()
            # stopped event, separating finished naturally (if there is valid
            # solution) from being forcefully stopped
            if self.__stop_now:
                to_json({
                    "stopped": True
                })
                return
            # moved down, so when GA is heavy (slow), user might stop it before the point is added
            # the point must not be added, so ga stops before executing below code
            to_json({
                "prv-fitness": prv_fitness,
                "fitness": cur_fitness,
                "generation": pop.generation,
                "genes": pop.fittest().genes,
            })
            # update prv_fitness
            prv_fitness = cur_fitness

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

    # should just resume the thread
    def __resume(self):
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

    def start(self):
        """
        starts thread activity if start method was not called
        before on this thread
        """
        if not self.start_triggered:
            self.start_triggered = True
            self.paused = False
            Thread.start(self)
        else:
            self.__resume()

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
ga_thread: Union[GAThread, type(None)] = None
solution: Union[Individual, type(None)] = None

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
g_number_of_1s = False
g_selection_type = 3

g_genes_data: Union[Dict, List, type(None)] = None


# g_genes_data = {i: randint(0, 100) if i < 28 else -1000 for i in range(32)}


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
    global g_number_of_1s
    global g_selection_type

    global g_genes_data

    if command.get('pop_size'):
        # population size
        g_pop_size = command.get('pop_size')
    if command.get('genes_num'):
        # genes number
        g_genes_num = command.get('genes_num')
    if command.get('co_rate'):
        # crossover rate change, it should not be 0
        g_co_rate = command.get('co_rate')
    if not isinstance(command.get('co_type'), type(None)):
        # crossover type
        g_co_type = int(command.get('co_type'))
    if not isinstance(command.get('mut_rate'), type(None)):
        # mutation rate change, can be 0
        g_mut_rate = float(command.get('mut_rate'))
    if not isinstance(command.get('mut_type'), type(None)):
        # mutation type
        g_mut_type = int(command.get('mut_type'))
    if not isinstance(command.get('del_rate'), type(None)):
        # sleep in seconds
        g_del_rate = float(command.get('del_rate'))
    if not isinstance(command.get('selection_type'), type(None)):
        #
        g_selection_type = float(command.get('selection_type'))
    if not isinstance(command.get('pause_gen'), type(None)):
        # pause generations
        g_pause_gen = False if command.get(
            'pause_gen') is False else float(command.get('pause_gen'))
    if not isinstance(command.get('max_gen'), type(None)):
        # maximum generations
        g_max_gen = False if command.get(
            'max_gen') is False else float(command.get('max_gen'))
    if not isinstance(command.get('update_pop'), type(None)):
        # specifies when to update_population
        # if 0:
        #   parent is replaced only when offspring fitness is better than parent's
        # else: (it equals 1)
        #   parent is always replaced by offspring
        g_update_pop = int(command.get('update_pop'))

    # if command.get('ff'):
    #     import_module(command.get('ff'))
    if not isinstance(command.get('number_of_1s'), type(None)):
        g_number_of_1s = False if command.get(
            'number_of_1s') is False else int(command.get('number_of_1s'))

    if not isinstance(command.get('g_genes_data'), type(None)):
        pass
    if not isinstance(command.get('fitness_function'), type(None)):
        pass


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
        if ga_thread is None or not ga_thread.is_alive():
            init_ga()
        # start if this is new initiated ga_thread, else it resumes
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
        # noinspection PyBroadException
        try:
            load = loads(cmd)
        except Exception:
            pass
        else:
            update_parameters(load)
