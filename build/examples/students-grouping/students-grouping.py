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
# number of students, basically number of groups *  number of students per groupe, so (g_group_length * g_groups_num)
g_stds_num = g_group_length * g_groups_num

# to verify only once (at the beginning)
initial_verified = False


def deserialize(genes: list) -> list:
    """
    convert list of 0s and 1s values to int values.
    """
    return [
        int(
            ''.join(map(lambda gene: str(gene), genes[i:i+g_block_length])),
            2
        ) for i in range(0, len(genes), g_block_length)
    ]


def calc_crossover(parents_genes: List[List[List[int]]], co_rate: float, genes_num: int) -> List[List[List[int]]]:
    """
    Not necessary, however when provided and returns value other than None, the simulator is going to use
    this one instead of the given ones by default, if you are not intending to use it leave it to `return None`
    """
    to_terminal('info', 'INFO', 'SG crossover function here.')
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
    to_terminal('info', 'INFO', 'SG mutation function here.')
    global g_block_length
    global g_stds_num

    for couple in offsprings:
        for offspring in couple:
            deserialized_stds = deserialize(offspring)
            for index in range(0, g_stds_num):
                student = deserialized_stds[index]
                if student > 27 or deserialized_stds.count(student) > 1:
                    offspring[index * g_block_length: (index + 1) * g_block_length] = [
                        1 if randint(0, 999) / 1000 < mut_rate else 0 for _ in range(g_block_length)
                    ]
                    deserialized_stds = deserialize(offspring)
                else:
                    if randint(0, 999) / 1000 < mut_rate:
                        offspring[
                            index * g_block_length: (index + 1) * g_block_length
                        ], offspring[
                            (index + 1) % g_stds_num * g_block_length: (index + 2) % g_stds_num * g_block_length
                        ] = offspring[
                            (index + 1) % g_stds_num * g_block_length: (index + 2) % g_stds_num * g_block_length
                        ], offspring[
                            index * g_block_length: (index + 1) * g_block_length
                        ]
    return offsprings


def get_fitness(genes: List[int], data: Union[Dict, List, Tuple, Set]) -> Union[float, int]:
    """
    Fitness Function Template, wrap return statement with int() or float() to indicate the intended type
    so the simulator can detect its type(useful for the graph).

    : param genes: genes of a given individual/chromosome which consists of a list of 0s and 1s.
    : param data: genes data loaded of the given path inside GA Control Panel.

    """
    global g_block_length
    global g_group_length
    global g_groups_num
    global initial_verified
    global g_stds_num

    if (data == None):
        to_terminal('error', 'ERROR', 'please import genes data.')

    if not initial_verified:
        initial_verified = True
        if (len(genes) == g_block_length * g_stds_num):
            to_terminal('info', 'INFO', 'genes number is correct.')
        else:
            to_terminal('error', 'ERROR', 'genes number is not correct (should be {}).'.format(
                g_block_length * g_stds_num
            ))

    # this stores visited students to monitor students visited, if student is visited twice,
    # those genes should get very low value to be eliminated.
    visited_students = []
    fitnesses = []

    deserialized_students = deserialize(genes)

    for group_index in range(g_groups_num):
        group_fitness = 0
        for student_index in range(g_group_length):
            student = deserialized_students[
                group_index * g_group_length + student_index
            ]
            if not student in visited_students:
                visited_students.append(student)
                group_fitness += data.get(
                    str(student)
                )
        fitnesses.append(group_fitness)

    med = sum(fitnesses) // g_groups_num

    return - int(
        sum(abs(abs(fitness) - med) for fitness in fitnesses)
        + 10000 * (
            len(deserialized_students) -
            len(list(filter(lambda std: std < 28, dict.fromkeys(deserialized_students))))
        )
    )


if __name__ == "__main__":
    genes = [0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0,
             1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1]
    # offsprings = calc_mutation(
    #     [
    #         [genes,
    #          [randint(0, 100) % 2 for _ in range(g_block_length * g_stds_num)]]
    #     ],
    #     .5,
    #     g_block_length * g_stds_num
    # )
    # print(get_fitness(offsprings[0][0]))
    # calc_mutation([
    #     [[randint(0, 100) % 2 for _ in range(g_block_length * g_stds_num)],
    #      [randint(0, 100) % 2 for _ in range(g_block_length * g_stds_num)]],
    #     [[randint(0, 100) % 2 for _ in range(g_block_length * g_stds_num)],
    #      [randint(0, 100) % 2 for _ in range(g_block_length * g_stds_num)]]
    # ],
    #     .5,
    #     g_block_length * g_stds_num
    # )
    result = get_fitness(
        # offsprings[0][0],
        genes,
        {
            "0": 53,
            "1": 50,
            "2": 86,
            "3": 89,
            "4": 99,
            "5": 73,
            "6": 54,
            "7": 84,
            "8": 59,
            "9": 99,
            "10": 71,
            "11": 95,
            "12": 69,
            "13": 85,
            "14": 51,
            "15": 88,
            "16": 78,
            "17": 66,
            "18": 71,
            "19": 52,
            "20": 78,
            "21": 86,
            "22": 81,
            "23": 80,
            "24": 61,
            "25": 50,
            "26": 99,
            "27": 97,
            "28": -10000,
            "29": -10000,
            "30": -10000,
            "31": -10000
        }
        #     # [randint(0, 100) % 2 for _ in range(140)],
        #     # {str(i): randint(50, 100) if i < 28 else -10000 for i in range(32)}

    )
    print(result)


# serialized = [int(''.join(map(lambda sol: str(sol), solu[i:i+5])), 2) for i in range(0, 140, 5)]
# g_genes_data = {i: randint(0, 100) if i < 28 else -1000 for i in range(32)}
# list(filter(lambda etud: 27 < etud, serialized))
