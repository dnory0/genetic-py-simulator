# python part

# distributing part:

### GA python file not found because it's packed inside app.asar

- this issue is only faced on production and not development, since
  the app needs to be packed inside app.asar file in the end, the
  python file is also going to be there, then when user launch the app
  and hit start button the file is going to be unreachable since
  python has no way to access the app.asar file and will fire a **file
  not found** error.
- possible solution: move file to tmp directory on startup. (@deprecated)
- use pyinstaller to bundle python code into executable file

### exclude some files that are not of any use in production mode

# timer part:

## improvements: (@deprecated for now)

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
