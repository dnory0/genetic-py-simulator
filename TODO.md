# electron part

remove os-utils (deprecated, and os-utils moved to secondary-process)
use close tooltip (saved on source file -ignore it-)

# chart part

fix tooltip still off after GA finished

# python part

### make selection of parents more random instead of first best parents:

- current behavior: select first and goes through population
  and if it finds better one it replace it with old one, that means
  if you hit the best but there are others with the same fitness value
  it's going to ignore them resulting to only selecting the first best
  one which may affect the diversity of the GA.
- aimed behavior: have a collection of the same with the best fitness
  value and randomize selection between them.

### make GA robust, steps:

- wait for electron part to send 'start' signal to start GA.
- put it inside a while loop, to prevent electron part from terminating
  and forking the GA process every time user launches it.

### create fitness calc class to handle fitness calc for offspring str

# distributing part:

### GA python file not found because it's packed inside app.asar

- this issue is only faced on production and not development, since
  the app needs to be packed inside app.asar file in the end, the
  python file is also going to be there, then when user launch the app
  and hit start button the file is going to be unreachable since
  python has no way to access the app.asar file and will fire a **file
  not found** error.
- possible solution: move file to tmp directory on startup.

### exclude some files that are not of any use in production mode

# timer part:

## improvements:

- make timeChecker being cleared when timer paused instead of using
  sendTime variable, create new time checker when timer resumed.
- put the whole process work on a class for possibility to instantiate
  more than one timer when needed.
- move it to be a thread on the renderer process instead of separate one

# for me:

- learn docker
- learn venv
- learn to debug
- learn using tests

redesign the way the IPC between the renderer process and pyshell
process communicate (see non-blocking-stdin project on py folder)
