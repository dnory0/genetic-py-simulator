from json import loads

# reading the solution of the simulator
str_solution = input("paste the solution: ")

# parsing solution from string to list
try:
    solution = loads(str_solution)
except Exception as ex:
    print('the solution given is not usable.')
    exit(1)

assert len(solution) == 140

# reading the genes data passed to the simulator
str_genes_data = input("paste the students scores (genes data): ")

# parsing genes data from string to dict
try:
    genes_data = loads(str_genes_data)
except Exception as ex:
    print('the genes data given are not usable.')
    exit(1)

# change elements type of solution to string
solution = [str(solution[i]) for i in range(140)]

# creating the blocks of 5 bits because 5 bits -> 1 student, supposedly we have 28 students.
students_aslist = [''.join(solution[i:i+5]) for i in range(0, 140, 5)]

assert len(students_aslist) == 28

# change representation from binary to int from 0 to 27
students_aslist = [int(students_aslist[i], 2) for i in range(28)]

# this is to have a break space between inputs and output
print()

# printing the 4 groups
for i in range(4):
    print(
        "group {} has the following members: {}, and the group fitness is: {}".format(
            str(i+1),
            str(students_aslist[i*7: i*7+7]),
            str(sum(
                genes_data.get(str(std)) for std in students_aslist[i*7: i*7+7]
            ))
        )
    )
