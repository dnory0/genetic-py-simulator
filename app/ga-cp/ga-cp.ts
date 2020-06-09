import { IpcRenderer, OpenDialogReturnValue } from 'electron';

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
 * - ```-4``` if the file extention is not equal to any of the given ```ext```.
 * - ```0``` if path matchs all conditions.
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
 * load buttons
 */
let loadBtns = <HTMLButtonElement[]>Array.from(document.getElementsByClassName('load-btn'));
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

browseBtns.forEach(function(browseBtn) {
  let type = browseBtn.classList.contains('genes-data')? 'genes-data': 'fitness-function';
  let pathInput = pathInputs.filter((pathInput) => pathInput.classList.contains(type))[0];

  browseBtn.onclick = () => {
    ipcRenderer.once('browsed-path', (_ev, result: OpenDialogReturnValue) => {
      if (result.canceled) return;
      pathInput.value = result.filePaths[0];
      pathInput.dispatchEvent(new Event('browsedPath'));
    });

    ipcRenderer.send(
      'browse', 
      type == 'genes-data'? {
        name: 'JSON File (.json)',
        extensions: ['json', 'jsonc', 'js'],
      }: 
      {
        name: 'Python File (.py)',
        extensions: ['py', 'py3'],
      },
    );
  }
});

let checkPathInput = (pathInput: HTMLInputElement, type: string) => {
  if (!pathInput.value) return;
  clearTimeout(pathInput['bgTimeout'])
  pathInput['bgTimeout'] = setTimeout(() => pathInput.style.backgroundColor = '', 1500)
  if (validatePath(pathInput.value, ... type == 'genes-data'? ['.json', '.jsonc', '.js']:['.py', '.py3']) == 0) {
    pathInput.style.backgroundColor = '#a8fba8';
    return true;
  } else {
    pathInput.style.backgroundColor = '#ffbfbf';
    return false;
  }
}

pathInputs.forEach(pathInput => {
  let type = pathInput.classList.contains('genes-data')? 'genes-data': 'fitness-function';
  pathInput.addEventListener('keyup', (ev) => {
    if (ev.key != 'Enter') return;
    checkPathInput(pathInput, type);
  });
})

loadBtns.forEach(loadBtn => {
  let type = loadBtn.classList.contains('genes-data')? 'genes-data': 'fitness-function';
  let pathInput = pathInputs.filter(pathInput => pathInput.classList.contains(type))[0];
  let treeContainer = document.querySelector('.genes-tree');
  loadBtn.onclick = () => {
    // todo: add test fitness-function
    if (type == 'fitness-function') {
      alert('no python load for now');
      return;
    }
    if (checkPathInput(pathInput, type)) {
      fetch(pathInput.value)
      .then((res) => res.text())
      .then(data => {
        try {
          JSON.parse(data)
        } catch (error) {
          // alert('This json data contains error!')
          alert(error)
          return;
        }
        Array.from(treeContainer.getElementsByClassName('json-container')).forEach(jsonContainer => jsonContainer.remove())
        window['jsonTree'](treeContainer, data);
        treeContainer.firstElementChild.classList.add('scrollbar')
      });
    }
  };
});

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
    revertBtn.disabled = true;
    saveBtn.disabled = true;
    isClosable = true;
    curSettings = revertSettings;
    affectSettings(revertSettings['renderer']['input'], 'ga-cp');
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
      input.addEventListener('keypress', eventListener);
      input.addEventListener('paste', eventListener);
      if (input.classList.contains('load-path')) {
        input['isGACP'] = true;
        // this is triggered when path is browsed using browse button
        input.addEventListener('browsedPath', eventListener);
      } else {
        input.addEventListener('keyup', ev => {
          if (['ArrowUp', 'ArrowDown'].includes(ev.key)) eventListener();
        });
        if (input.classList.contains('textfieldable')) {
          input.addEventListener('change', eventListener);
        }
      }
    }
  });

  (<HTMLButtonElement[]>Array.from(document.getElementsByClassName('random-btn'))).forEach(randomBtn =>
    randomBtn.addEventListener('click', eventListener)
  );
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
    var param = randomBtn.parentElement.parentElement.parentElement;

    if (<HTMLInputElement>param.previousElementSibling && !(<HTMLInputElement>param.previousElementSibling).checked) return;

    randomBtn.click();
  });
};
/**
 * force textfields input that applies to textfieldable inputs
 */
document.getElementById('force-tf-enabled').addEventListener('change', ev => {
  Array.from(document.getElementsByClassName('textfieldable')).forEach((textfieldable: HTMLInputElement) => {
    textfieldable.type = (<HTMLInputElement>ev.target).checked ? 'text' : 'range';
  });
});

let toggleDisableOnRun = (disable: boolean) => {
  (<HTMLInputElement[]>(
    (<HTMLDivElement[]>Array.from(document.getElementsByClassName('param-value'))).map(paramValue => paramValue.firstElementChild)
  )).forEach(gaParam => {
    if (!gaParam.classList.contains('disable-on-run')) return;
    curSettings['renderer']['input'][gaParam.id]['disable'] = disable;
    gaParam.disabled = disable;
    (<HTMLButtonElement>gaParam.parentElement.nextElementSibling.firstElementChild).disabled = disable;
    gaParam.parentElement.parentElement.title = !disable ? '' : 'Disabled when GA is Running';
  });

  let gaTypes = (<HTMLDivElement[]>Array.from(document.getElementsByClassName('type-value')))
    .reduce((accum: Element[], typeValue) => accum.concat(...Array.from(typeValue.children)), [])
    .map((label: HTMLLabelElement) => <HTMLInputElement>label.firstElementChild)
    .filter(radioInput => radioInput.name != 'update_pop');
  curSettings['renderer']['input'][gaTypes[0].name.replace('_', '-')]['disable'] = disable;
  gaTypes.forEach(gaType => {
    gaType.disabled = disable;
    gaType.parentElement.parentElement.title = disable ? 'Disabled when GA is Running' : '';
  });
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

/**
 * affects settings to inputs
 */
window['affectSettings'](curSettings['renderer']['input'], 'ga-cp');
/**
 * add functionality to update settings onchange event for inputs
 */
window['saveSettings'](curSettings['renderer']['input']);
// apply one of the .disable-on-run to be
toggleDisableOnRun(curSettings['renderer']['input']['pop-size']['disable']);

window['border']();
