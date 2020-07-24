from importlib.util import spec_from_file_location, module_from_spec
from json import dumps
from sys import argv

# print(argv)

# loading module spec, will raise FileNotFoundError if path is incorrect
spec = spec_from_file_location("", "/media/dnory0/work/projects/nodejs/linux/genetic-py/build/python/ff.py")

ff_holder = module_from_spec(spec)

# execute module, any exception can raise of it, common one is SyntaxError
spec.loader.exec_module(ff_holder)

# retrieve the fitness function out of the module, raises AttributeError if get_fitness is not implemented on module
get_fitness = ff_holder.get_fitness

# temp
# print(get_fitness([], []))
print(get_fitness([1, 0, 1], [45, 12, 8]))


# from os.path import basename, splitext

# print(splitext(basename('/root/ga.py'))[0])


# def load_ff():
# try:

# except FileNotFoundError as fileNotFoundError:
#   to_json({
#     "error": {

#       "code": fileNotFoundError.args[0],
#       "message": fileNotFoundError.args[1]
#     }
#   })

# except SyntaxError as syntaxError:
#   to_json({
#     "error": {
#       "type": type(syntaxError).__name__,
#       "message": syntaxError.args[0],
#       "details": syntaxError.args[1]
#     }
#   })

# except Exception as e:
#   to_json({
#     "error": {
#       "message": str(type(e))
#     }
#   })
  # print(e.args)
  # to_json({
  #   "Error": "Syntax Error"
  # })


# def to_json(word: dict):
#     """ 
#     prints a dict to json and flush it for instant respond (doesn't buffer output)
#     """
#     print(dumps(word), flush=True)


# while True:
#   cmd = input()
#   if cmd == 'load': load_ff()
#   elif cmd == 'exit': exit(0)
