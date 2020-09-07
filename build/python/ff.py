from typing import List, Union, Dict, Tuple, Set, Any, Literal
from functools import reduce
from json import dumps


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


def calc_crossover(parents_genes: List[List[List[int]]], co_rate: float, genes_num: int) -> List[List[List[int]]]:
    """
    Not necessary, however when provided and returns value other than None, the simulator is going to use 
    this one instead of the given ones by default, if you are not intending to use it leave it to `return None`
    """
    return None


def calc_mutation(offsprings: List[List[List[int]]], mut_rate: float, genes_num: int) -> List[List[List[int]]]:
    """
    Not necessary, however when provided and returns value other than None, the simulator is going to use 
    this one instead of the given ones by default, if you are not intending to use it leave it to `return None`
    """
    return None


def get_fitness(genes: List[int], data: Union[Dict, List, Tuple, Set]) -> Union[float, int]:
    """
    Fitness Function Template, wrap return statement with int() or float() to indicate the intended type
    so the simulator can detect its type (useful for the graph).

    :param genes: genes of a given individual/chromosome which consists of a list of 0s and 1s.
    :param data: genes data loaded of the given path inside GA Control Panel.

    """

    # TODO: implemented by user
    return 0
