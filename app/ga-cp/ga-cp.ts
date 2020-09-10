import { IpcRenderer, OpenDialogReturnValue, SaveDialogReturnValue } from 'electron';
import { ChildProcess } from 'child_process';

let pyshell: ChildProcess = window['pyshell'];

let ipcRenderer: IpcRenderer = window['ipcRenderer'];
/**
 * revert settings, not updated when inputs change value
 */
let revertSettings: object = window['settings'];
/**
 * current/temp settings, updated when inputs change value, and saves to
 * revertSettings only when user presses save button.
 */
let curSettings: object = JSON.parse(JSON.stringify(window['settings']));
delete window['settings'];
(() => {
  const { toggleMutTypeDisable, toggleCOInputDisable } = window['specialParamsCases'];
  /**
   * affects settings to inputs
   */
  window['affectSettings'](curSettings['renderer']['input'], 'ga-cp', toggleCOInputDisable, toggleMutTypeDisable);
  /**
   * add functionality to update settings onchange event for inputs
   */
  window['saveSettings'](curSettings['renderer']['input'], 'ga-cp', toggleCOInputDisable, toggleMutTypeDisable);
})();

window['border']();

/**
 *
 */
let isClosable = true;
/**
 * checks if given path is valid, check conditions are ordered and return value is as follows:
 *
 * - ```-1``` if path does not exist.
 * - ```-2``` if path is not an absolute path.
 * - ```-3``` if path does not point to a file.
 * - ```-4``` if the file extension is not equal to any of the given ```ext```.
 * - ```0``` if path matches all conditions.
 *
 * @param filePath file path to check & validate.
 * @param exts extensions array.
 */
let validatePath: (filePath: string, ...exts: string[]) => number = window['validatePath'];

/**
 * browse buttons
 */
let browseBtns = <HTMLButtonElement[]>Array.from(document.getElementsByClassName('browse-btn'));
/**
 * load buttons and shows content of genes data files/output of testing fitness function
 */
let loadBtns = <HTMLButtonElement[]>Array.from(document.getElementsByClassName('load-data-btn'));
/**
 * get template of fitness function file
 */
let getTemplateBtn = <HTMLButtonElement>document.getElementById('get-template-btn');
/**
 * inputs that take the path to whether genes data or fitness function
 */
let pathInputs = <HTMLInputElement[]>Array.from(document.getElementsByClassName('load-path'));
/**
 * save button
 */
let saveBtn = <HTMLButtonElement>document.getElementById('save-btn');
/**
 * close button
 */
let closeBtn = <HTMLButtonElement>document.getElementById('close-btn');
/**
 * revert button
 */
let revertBtn = <HTMLButtonElement>document.getElementById('revert-btn');

let clearTerminalBtn = <HTMLInputElement>document.getElementById('clear-terminal-btn');

browseBtns.forEach(function (browseBtn) {
  let type = browseBtn.classList.contains('genes-data') ? 'genes-data' : 'fitness-function';
  let pathInput = pathInputs.find(pathInput => pathInput.classList.contains(type));

  browseBtn.onclick = () => {
    ipcRenderer.once('browsed-path', (_ev, result: OpenDialogReturnValue) => {
      if (result.canceled) return;
      pathInput.value = result.filePaths[0];
      loadBtns.find(loadBtn => loadBtn.classList.contains(type)).click();
    });

    ipcRenderer.send(
      'browse',
      type == 'genes-data'
        ? {
            name: 'JSON File (.json)',
            extensions: ['json', 'jsonc', 'js'],
          }
        : {
            name: 'Python File (.py)',
            extensions: ['py', 'py3'],
          }
    );
  };
});

/**
 * fetch data from the path in pathInput, and checks its validity
 * @param pathInput holds absolute path of a ```json``` file that holds data
 */
let validateData = async (pathInput: HTMLInputElement) => {
  return await fetch(pathInput.value)
    .then(res => res.text())
    .then(data => {
      curSettings['renderer']['input'][pathInput.id]['data'] = data;
      try {
        JSON.stringify(JSON.parse(data));
      } catch (e) {
        return false;
      }
      return true;
    });
};

// let validatePython = async ()

/**
 * checks if the path in pathInput is valid, and whether its data is valid according to given type
 * @param pathInput holds absolute path of a [```json``` | ```py```] file that holds data
 * @param type ```genes-data``` | ```fitness-function```, data type inside the file
 */
let validatePathInput = (pathInput: HTMLInputElement, type: string) => {
  clearTimeout(pathInput['bgTimeout']);
  pathInput['bgTimeout'] = setTimeout(() => (pathInput.style.backgroundColor = ''), 1500);
  if (type == 'genes-data') clearJSONOutput();
  curSettings['renderer']['input'][pathInput.id]['data'] = null;
  pathInput.dispatchEvent(new Event('browsedPath'));
  let extensions = type == 'genes-data' ? ['.json', '.jsonc', '.js'] : ['.py', '.py3'];
  if (validatePath(pathInput.value, ...extensions) == 0) {
    pathInput.style.backgroundColor = '#a8fba8';
    return true;
  } else {
    pathInput.style.backgroundColor = '#ffbfbf';
    return false;
  }
};

/**
 * to loads data when Enter key pressed inside pathInputs
 */
pathInputs.forEach(pathInput => {
  let type = pathInput.classList.contains('genes-data') ? 'genes-data' : 'fitness-function';
  pathInput.addEventListener('keyup', ev => {
    if (ev.key != 'Enter') return;
    validatePathInput(pathInput, type);
  });
  setTimeout(() => {
    if (curSettings['renderer']['input'][pathInput.id]['data'] == undefined) {
      let loadBtn = loadBtns.find(loadBtn => loadBtn.classList.contains(type));
      let browseBtn = browseBtns.find(browseBtn => browseBtn.classList.contains(type));
      let extensions = type == 'genes-data' ? ['.json', '.jsonc', '.js'] : ['.py', '.py3'];
      let flickerBtn = validatePath(pathInput.value, ...extensions) == 0 ? loadBtn : browseBtn;

      // there is no way to detect if fitness-function is loaded or not
      if (type == 'fitness-function' && flickerBtn == loadBtn) return;

      flickerBtn.classList.add('notice-me');
      setTimeout(() => flickerBtn.classList.add('notice-me-transition'), 0);
      setTimeout(() => flickerBtn.classList.add('fade-white'), 200);
      setTimeout(() => flickerBtn.classList.remove('fade-white'), 350);
      setTimeout(() => flickerBtn.classList.add('fade-white'), 550);
      setTimeout(() => flickerBtn.classList.remove('notice-me', 'fade-white', 'notice-me-transition'), 750);
    }
  });
});

let clearJSONOutput = () => {
  let treeContainer = document.querySelector('.genes-tree');
  Array.from(treeContainer.getElementsByClassName('json-container')).forEach(jsonContainer => jsonContainer.remove());
};

let clearTerminalOutput = () => (clearTerminalBtn.parentElement.nextElementSibling.innerHTML = '');

let loadBtnsPressed = false;

loadBtns.forEach(loadBtn => {
  let type = loadBtn.classList.contains('genes-data') ? 'genes-data' : 'fitness-function';
  let pathInput = pathInputs.find(pathInput => pathInput.classList.contains(type));
  let treeContainer = document.querySelector('.genes-tree');
  loadBtn.onclick = async () => {
    loadBtnsPressed = true;
    if (!validatePathInput(pathInput, type)) return;
    if (type == 'fitness-function') {
      pyshell.stdin.write(
        JSON.stringify({
          test_user_code_path: pathInput.value,
        }) + '\n'
      );
      return;
    }
    let validationResult = await validateData(pathInput);
    pyshell.stdin.write(
      JSON.stringify({
        test_genes_data: curSettings['renderer']['input']['genes-data-path']['data'],
      }) + '\n'
    );
    if (validationResult) {
      window['jsonTree'](treeContainer, curSettings['renderer']['input']['genes-data-path']['data']);
      treeContainer.firstElementChild.classList.add('scrollbar');
    }
  };
});

getTemplateBtn.onclick = () => {
  ipcRenderer.send('download-template', {
    name: 'Python File (.py)',
    extensions: ['py', 'py3'],
  });
};

(() => {
  /**
   * bottom-right buttons setup
   */
  saveBtn.onclick = () => ipcRenderer.send('ga-cp-finished', curSettings);

  closeBtn.onclick = () => {
    if (isClosable) ipcRenderer.send('ga-cp-finished');
    else ipcRenderer.send('close-confirm');
  };

  revertBtn.onclick = () => {
    clearJSONOutput();
    clearTerminalOutput();
    revertBtn.disabled = true;
    saveBtn.disabled = true;
    isClosable = true;
    curSettings = revertSettings;
    (() => {
      const { toggleMutTypeDisable, toggleCOInputDisable } = window['specialParamsCases'];
      affectSettings(revertSettings['renderer']['input'], 'ga-cp', toggleCOInputDisable, toggleMutTypeDisable);
    })();
  };

  /**
   * if any input changed value make the window not closable
   * without confirmation, enable revert and save buttons.
   */
  let eventListener = () => (revertBtn.disabled = saveBtn.disabled = isClosable = false);

  Array.from(document.getElementsByTagName('input')).forEach(input => {
    if (input.type == 'checkbox') {
      input.addEventListener('change', eventListener);
    } else if (input.type == 'radio') {
      input.addEventListener('change', eventListener);
    } else {
      if (input.classList.contains('load-path')) {
        // this is triggered when path is browsed using browse button
        input.addEventListener('browsedPath', eventListener);
      }
      input.addEventListener('keypress', eventListener);
      input.addEventListener('paste', eventListener);
      input.addEventListener('keyup', ev => {
        if (['ArrowUp', 'ArrowDown'].includes(ev.key)) eventListener();
      });
      if (input.classList.contains('textfieldable')) {
        input.addEventListener('change', eventListener);
      }
    }
  });

  (<HTMLButtonElement[]>Array.from(document.getElementsByClassName('random-btn'))).forEach(randomBtn =>
    randomBtn.addEventListener('click', eventListener)
  );

  clearTerminalBtn.addEventListener('click', clearTerminalOutput);
})();

/**
 * add ability for some labels/buttons to be triggered by pressing the altKey
 */
window['altTriggers']();
/**
 * setup params
 */
window['params']();

/**
 * random all button
 */
(<HTMLButtonElement>document.getElementById('random-all-btn')).onclick = () => {
  (<HTMLButtonElement[]>Array.from(document.getElementsByClassName('random-btn'))).forEach(randomBtn => {
    const param = randomBtn.parentElement.parentElement.parentElement;

    if (<HTMLInputElement>param.previousElementSibling && !(<HTMLInputElement>param.previousElementSibling).checked) return;

    randomBtn.click();
  });
};
/**
 * force textfield type on inputs that applies to textfieldable class
 */
document.getElementById('force-tf-enabled').addEventListener('change', ev => {
  Array.from(document.getElementsByClassName('textfieldable')).forEach((textfieldable: HTMLInputElement) => {
    textfieldable['switchTextfieldable'](textfieldable, ev.target);
  });
});

let toggleDisableOnRun = (disable: boolean) => {
  (<HTMLInputElement[]>(<HTMLDivElement[]>Array.from(document.getElementsByClassName('param-value'))).map(paramValue => {
    return paramValue.classList.contains('double-sync')
      ? paramValue.querySelector('.main-double-sync')
      : paramValue.firstElementChild;
  })).forEach(gaParam => {
    if (!gaParam.classList.contains('disable-on-run')) return;
    curSettings['renderer']['input'][gaParam.id]['disable'] = disable;
    gaParam.parentElement.parentElement.title = !disable ? '' : 'Disabled when GA is Running';
    gaParam.disabled = (gaParam.classList.contains('forced-disable') && gaParam.disabled) || disable;
    (<HTMLButtonElement>gaParam.parentElement.nextElementSibling.firstElementChild).disabled = disable;
    try {
      (<HTMLInputElement>gaParam.parentElement.parentElement.parentElement.previousElementSibling).disabled = disable;
    } catch (e) {}
  });

  let gaTypes = (<HTMLDivElement[]>Array.from(document.getElementsByClassName('type-value')))
    .reduce((accum: Element[], typeValue) => accum.concat(...Array.from(typeValue.children)), [])
    .map((label: HTMLLabelElement) => <HTMLInputElement>label.firstElementChild)
    .filter(radioInput => radioInput.name != 'update_pop');
  curSettings['renderer']['input'][gaTypes[0].name.replace('_', '-')]['disable'] = disable;
  gaTypes.forEach(gaType => {
    gaType.disabled = (gaType.classList.contains('forced-disable') && gaType.disabled) || disable;
    gaType.parentElement.parentElement.title = disable ? 'Disabled when GA is Running' : '';
  });

  pathInputs.forEach(pathInput => (pathInput.disabled = disable));
  browseBtns.forEach(browseBtns => (browseBtns.disabled = disable));
  loadBtns.forEach(loadBtn => (loadBtn.disabled = disable));
};

ipcRenderer.on('update-settings', (_ev, activate: boolean) => {
  toggleDisableOnRun(!activate);
});
/**
 * if user tries to close window using the top bar close button, window has to
 * assure that the window is closable (no input has changed value), if closable
 * it closes immediately, else it shows confirmation dialog.
 */
ipcRenderer.on('close-confirm', () => {
  if (isClosable) ipcRenderer.send('ga-cp-finished');
  else ipcRenderer.send('close-confirm');
});

let terminal = clearTerminalBtn.parentElement.nextElementSibling;

let treatMessage = (data: object) => {
  if (!data || !data['terminal']) return;
  let line = document.createElement('div');
  line.classList.toggle(data['line-type'], true);
  line.innerHTML = `${['', null, undefined, []].includes(data['msg-type']) ? '' : data['msg-type'] + ': '}${
    data['message'] ? data['message'] : '&lt;message with no content&gt;'
  }`;
  terminal.appendChild(line);
};

pyshell.stdout.on('data', (chunk: Buffer) => {
  if (loadBtnsPressed) {
    loadBtnsPressed = false;
    if (terminal.children.length) {
      treatMessage({
        terminal: true,
        message: '--------------------------------------------',
      });
    }
  }
  // console.log(chunk.toString());
  chunk
    .toString()
    .split(/(?<=\n)/g)
    .map((data: string) => {
      try {
        return JSON.parse(data);
      } catch (e) {
        treatMessage({
          terminal: true,
          'line-type': 'warning',
          'msg-type': 'WARNING',
          message:
            'Detected uncontrolled output, your GA is not affected, but avoid using a print statement inside the imported python file, use to_terminal() provided with the template.',
        });
        return {};
      }
    })
    .forEach((data: object) => treatMessage(data));
});

// open error listener, this is logged inside the devTool console, debug reasons only
pyshell.stderr.on('data', (chunk: Buffer) => {
  console.error(chunk.toString());
});

// apply one of the .disable-on-run to be
toggleDisableOnRun(curSettings['renderer']['input']['pop-size']['disable']);
