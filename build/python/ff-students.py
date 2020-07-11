from typing import List, Union, Dict, Tuple, Set
from random import randint
from math import floor


def get_fitness(genes: List[int], data: Union[Dict, List, Tuple, Set]) -> Union[int, float]:
    # this stores visited students to monitor students visited, if student is visited twice, those genes should get very low value to be eliminated.
    visited_students = []
    fitnesses = []
    # 4 groups
    for group_index in range(4):
        group_fitness = 0
        # each group has 7 students, every student is represented with 5 bits
        for student_index in range(7):
            student = genes[
                group_index * 35 + student_index * 5:
                group_index * 35 + (student_index + 1) * 5
            ]
            if student in visited_students:
                group_fitness += -1000
            else:
                visited_students.append(student)
                group_fitness += data.get(
                    int(''.join(str(e) for e in student), 2)
                )

        fitnesses.append(group_fitness)
    if (any(group_fitness < 0 for group_fitness in fitnesses)):
        return int(sum(fitnesses))
    else:
        print(str(fitnesses))
        return floor(sum(fitnesses) / 4 - min(fitnesses))


# gen_data = {}
# for i in range(32):
#     gen_data[i] = randint(0, 100) if i < 28 else -1000
gen_data = {i: randint(0, 100) if i < 28 else -1000 for i in range(32)}

genes_arr = [0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1,
             1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0]
# gen_genes = ''.join([str(randint(0, 100) % 2) for _ in range(140)])
# gen_genes = ''.join(bin(i)[2:].zfill(5) for i in range(28))

print(gen_data)
# print(gen_genes)
# print([gen_genes[i*5: (i+1)*5] for i in range(28)])
# print(get_fitness(gen_genes, gen_data))
print(get_fitness(genes_arr, gen_data))
