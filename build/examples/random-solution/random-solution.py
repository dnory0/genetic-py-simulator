from typing import List, Union, Dict, Tuple, Set, Any, Literal
from functools import reduce
from json import dumps
from random import random


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


solution = None


def init_solution(genes_num: int):
    # initialize solution
    global solution
    solution = [
        1 if random() >= .5 else 0 for _ in range(genes_num)
    ]


def get_fitness(genes: List[int], data: Union[Dict, List, Tuple, Set]) -> Union[float, int]:
    """
    Fitness Function Template, wrap return statement with int() or float() to indicate the intended type
    so the simulator can detect its type (useful for the graph).

    :param genes: genes of a given individual/chromosome which consists of a list of 0s and 1s.
    :param data: genes data loaded of the given path inside GA Control Panel.

    """
    global solution
    if isinstance(solution, type(None)):
        init_solution(len(genes))
    return sum(1 for ind_gene, solution_gene in zip(genes, solution) if int(ind_gene) == solution_gene)
