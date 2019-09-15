import sys
import random

# designed for cases that user execute this file without supplying
# genes number (genes number per individual) and/or population size
# (individuals number) as arguments
genes_num = sys.argv[1] if sys.argv.__len__() > 1 else 64
ind_num = sys.argv[2] if sys.argv.__len__() > 2 else 100


class Individual:
    def __init__(self, genes=None, genes_length: int = 64):
        self.__genes = []
        if genes is not None:
            self.set_genes(genes)
        else:
            self.__genes = []
            for _ in range(genes_length):

                self.__genes.append(random.randrange(0, 100) % 2)

    def set_gene(self, index: int, gene: int):
        self.__genes[index] = (int(gene))

    def set_genes(self, genes):
        self.__genes = []
        for gene in genes:
            self.__genes.append(int(gene))

    def calc_fitness(self, solution) -> int:
        fitness = 0
        for gene, solution_gene in zip(self.__genes, iter(solution.__str__())):
            if gene == solution_gene:
                fitness += 1
        return fitness

    def __str__(self, packed: bool = False):
        if packed:
            packed_genes = ""
            for gene in self.__genes:
                packed_genes += str(gene)
            return packed_genes
        return self.__genes


class Population:
    def __init__(self, solution, pop_size: int = 100, genes_length: int = 64):
        self.solution = solution
        self.generation = 0
        self.__individuals = []
        for _i in range(0, pop_size):
            self.__individuals.append(
                Individual(genes_length=genes_length)
            )

    def get_fittest(self, second: bool = False):
        """Get the fittest or second fittest individual in the population
        Parameters
        ----------
        second : boolean, optional
            if set to true, the function returns second fittest (default is False)
        """
        real_fittest = self.get_fittest() if second else None
        fittest = self.__individuals[0]
        for individual in self.__individuals[1:]:
            if (fittest.calc_fitness(self.solution) < individual.calc_fitness(self.solution)) and (individual is not real_fittest):
                fittest = individual
        return fittest

    def get_less_fit(self, second: bool = False):
        real_less_fit = self.get_less_fit() if second else None
        less_fit = self.__individuals[0]
        for individual in self.__individuals[1:]:
            if individual.calc_fitness(self.solution) < less_fit.calc_fitness(self.solution) and (individual is not real_less_fit):
                less_fit = individual
        return less_fit

    def __str__(self):
        return self.__individuals


class GA:
    __cross_over_rate = .3
    __mutation_rate = .03

    def __init__(self, genes_length: int = 64):
        genes = []
        for _ in range(genes_length):
            # self.__genes.append(random.randrange(0, 100) % 2)
            genes.append(1)
            # genes.append(random.randrange(0, 100) % 2)
        self.solution = Individual(genes=genes)

    @staticmethod
    def set_mutation_rate(mutation_rate: float) -> type(None):
        GA.__mutation_rate = mutation_rate

    @staticmethod
    def get_mutation_rate() -> float:
        return GA.__mutation_rate

    @staticmethod
    def evolve_population(pop) -> type(None):
        parent1, parent2 = GA.__select(pop)
        # print("selection\n---------\n")
        # print("selection:\t" + str(parent1.calc_fitness(pop.solution)) +
        #       "\t" + str(parent2.calc_fitness(pop.solution)))
        # print("selection\n---------\n")
        # print("less_fit:\t" + str(pop.get_less_fit().calc_fitness(pop.solution)) +
        #       "\t" + str(pop.get_less_fit(True).calc_fitness(pop.solution)))
        # print(pop.get_less_fit() ==
        #       pop.get_less_fit(True))
        offspring1, offspring2 = GA.__cross_over(parent1, parent2)
        # print("cross_over\n-------_--\n")
        # print("cross_over:\t" + str(offspring1.calc_fitness(pop.solution)) +
        #       "\t" + str(offspring2.calc_fitness(pop.solution)))
        GA.__mutation(offspring1)
        GA.__mutation(offspring2)
        # print("mutation\n--------\n")
        # print("mutation:\t" + str(offspring1.calc_fitness(pop.solution)) +
        #       "\t" + str(offspring2.calc_fitness(pop.solution)))
        GA.__update_population(pop, offspring1, offspring2)
        pop.generation += 1

    @staticmethod
    def __select(pop):
        return pop.get_fittest(), pop.get_fittest(True)

    @staticmethod
    def __cross_over(parent1, parent2):
        offspring1_genes, offspring2_genes = [], []
        for gene1, gene2 in zip(parent1.__str__(), parent2.__str__()):
            if random.random() < GA.__cross_over_rate:
                offspring1_genes.append(gene1)
                offspring2_genes.append(gene2)
            else:
                offspring1_genes.append(gene2)
                offspring2_genes.append(gene1)
        # print(Individual.Individual(offspring1_genes).__str__(
        #     True) + "\n" + Individual.Individual(offspring2_genes).__str__(True))
        return Individual(offspring1_genes), Individual(offspring2_genes)

    @staticmethod
    def __mutation(offspring) -> type(None):
        for gene, i in zip(offspring.__str__(), range(len(offspring.__str__()))):
            if random.random() < GA.__mutation_rate:
                offspring.set_gene(i, 0 if gene else 1)

    @staticmethod
    def __update_population(pop, offspring1, offspring2) -> type(None):
        # print("before:\t\t" + str(pop.get_less_fit().calc_fitness(pop.solution)
        #                           ) + "\t" + str(pop.get_less_fit(True).calc_fitness(pop.solution)))
        pop.get_less_fit().set_genes(offspring1.__str__())
        pop.get_less_fit(True).set_genes(offspring2.__str__())
        # print("after:\t\t" + str(pop.get_less_fit().calc_fitness(pop.solution)
        #                          ) + "\t" + str(pop.get_less_fit(True).calc_fitness(pop.solution)))


# solution
solution = GA(genes_length=int(genes_num)).solution
# solution = GA().solution

# initial population
# my_pop = Population(solution, int(ind_num), int(genes_num))
# my_pop = Population(solution, genes_length=int(genes_num))
my_pop = Population(solution)


def launchCGA() -> "finished":
    # print(str(GA.get_mutation_rate()))
    while my_pop.get_fittest().calc_fitness(my_pop.solution) < my_pop.solution.calc_fitness(my_pop.solution):
        print("generation: " + str(my_pop.generation))
        print("elite-fitness: " +
              str(my_pop.get_fittest().calc_fitness(my_pop.solution)))
        print("elite-genes: " + my_pop.get_fittest().__str__(True))
        command: str = input()
        if (command == 'terminate'):
            return "finished"
        # if ('mutation' in adjust)
        # GA.set_mutation_rate(int(input() or 0))

        # print("less_fit 1: " + my_pop.get_less_fit().__str__(True) + ", fitness")
        GA.evolve_population(my_pop)
        # print(str(GA.get_mutation_rate()))

    # print("found, solution is: " + my_pop.get_fittest().__str__(True) +
    #       ", in " + str(my_pop.generation) + " generation.")
    print("found, generation: " + str(my_pop.generation))
    print("found, elite-fitness: " +
          str(my_pop.get_fittest().calc_fitness(my_pop.solution)))
    print("found, elite-genes: " + my_pop.get_fittest().__str__(True))
    return "finished"


# input()
print(launchCGA())
