from typing import List, Union, Dict, Tuple, Set, Any, Literal
from functools import reduce
from json import dumps
from random import randint
from math import floor, sqrt


def to_terminal(
        line_type: Union[Literal['warning', 'error', 'info', ''], None],
        msg_type: Union[Literal['WARNING', 'ERROR', 'INFO', ''], str, None],
        *message: Union[str, Tuple[Any], List[Any]]):
    """
    prints to terminal, use this instead of print statement if you want to examine output on Genetic Py terminal.
    :param line_type: this is used to determine the color of the message:
        * 'error' is red.
        * 'warning' is yellow.
        * 'info' is blue.
        * <empty string> or anything else is white.
    :param msg_type: the header of message, usually you find 'INFO', 'WARNING', 'ERROR, but you can use any string.
        * ex: passing "ERROR" to header is going to be: "ERROR: ", passing empty string or None results in no header.
    :param message: message to show after the header.
    """
    print(dumps({
        "terminal": True,
        "line-type": line_type,
        "msg-type": msg_type,
        "message": message[0] if len(message) == 0 else reduce(
            lambda accum_lines, line: accum_lines + '<br>' + line, message
        )
    }), flush=True)


# block length is the number of bits representing a student,
# used so that crossover is done in points that are block_length multiples,
# and mutation is done between blocks (students) instead of being done between bits which corrupt the work of fitness function.
g_block_length = 5
# every group has 7 students (blocks), in result, every group is presented by (g_block_length * g_group_length) bits
g_group_length = 7
# number of groups, genes number of every chromosome should equal to (g_block_length * g_group_length * g_groups_num) bits
g_groups_num = 4

# to verify only once (at the beginning)
initial_verified = False


def calc_crossover(parents_genes: List[List[List[int]]], co_rate: float, genes_num: int) -> List[List[List[int]]]:
    """
    Not necessary, however when provided and returns value other than None, the simulator is going to use 
    this one instead of the given ones by default, if you are not intending to use it leave it to `return None`
    """
    global g_block_length

    offsprings = []
    co_point = int(genes_num * co_rate // g_block_length * g_block_length)
    for p1_genes, p2_genes in parents_genes:
        offspring1 = p1_genes[: co_point]
        offspring1.extend(p2_genes[co_point:])
        offspring2 = p2_genes[: co_point]
        offspring2.extend(p1_genes[co_point:])
        offsprings.append([offspring1, offspring2])
    return offsprings


def calc_mutation(offsprings: List[List[List[int]]], mut_rate: float, genes_num: int) -> List[List[List[int]]]:
    """
    Not necessary, however when provided and returns value other than None, the simulator is going to use 
    this one instead of the given ones by default, if you are not intending to use it leave it to `return None`
    """
    global g_block_length

    for couple in offsprings:
        for offspring in couple:
            for index in range(0, genes_num, g_block_length):
                if randint(0, 999) / 1000 < mut_rate:
                    i, j = index % genes_num, (
                        index + g_block_length) % genes_num
                    offspring[i: i + g_block_length], offspring[
                        j: j + g_block_length] = offspring[j: j + g_block_length], offspring[i: i + g_block_length]
    return offsprings


def get_fitness(genes: List[int], data: Union[Dict, List, Tuple, Set]) -> Union[float, int]:
    """
    Fitness Function Template, wrap return statement with int() or float() to indicate the intended type
    so the simulator can detect its type (useful for the graph).

    :param genes: genes of a given individual/chromosome which consists of a list of 0s and 1s.
    :param data: genes data loaded of the given path inside GA Control Panel.

    """
    global g_block_length
    global g_group_length
    global g_groups_num
    global initial_verified

    if not initial_verified:
        initial_verified = True
        if (len(genes) == g_block_length * g_group_length * g_groups_num):
            to_terminal('info', 'INFO', 'genes number is correct.')
        else:
            to_terminal('error', 'ERROR', 'genes number is not correct (should be {}).'.format(
                g_block_length * g_group_length * g_groups_num
            ))

    # this stores visited students to monitor students visited, if student is visited twice, those genes should get very low value to be eliminated.
    visited_students = []
    fitnesses = []

    for group_index in range(g_groups_num):
        group_fitness = 0
        for student_index in range(g_group_length):
            student = genes[
                group_index * (g_group_length * g_block_length) + student_index * g_block_length:
                group_index * (g_group_length * g_block_length) +
                (student_index + 1) * g_block_length
            ]
            if student in visited_students:
                # 28 to 31 values are made to be avoided, and so assigned big negative value (i.e -10000) and so this is treated the same way
                group_fitness += data.get('31')
            else:
                visited_students.append(student)
                group_fitness += data.get(
                    str(int(''.join(str(e) for e in student), 2))
                )
        fitnesses.append(group_fitness)
    med = sum(fitnesses) // g_groups_num
    return - int(
        sum(abs(abs(fitness) - med) for fitness in fitnesses)
    )


if __name__ == "__main__":
    result = get_fitness(
        [randint(0, 100) % 2 for _ in range(140)],
        {str(i): randint(50, 100) if i < 28 else -10000 for i in range(32)}
    )
    print(result)

# serialized = [int(''.join(map(lambda sol: str(sol), solu[i:i+5])), 2) for i in range(0, 140, 5)]
# g_genes_data = {i: randint(0, 100) if i < 28 else -1000 for i in range(32)}
