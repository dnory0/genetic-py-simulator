/**
 * add the ability to autosave onto the given settings every time the input changes value.
 *
 * @param settings inputs settings object
 * @param targetedWindow targeted window: ```main``` | ```ga-cp```
 * @param toggleCOInputDisable disable crossover input if crossover type is 2 (Uniform) which does not require a value
 * @param toggleMutTypeDisable <ga-cp only> disable mutation type incompatible labels when number of 1s input is checked
 */
function saveSettings(
    settings: object,
    targetedWindow: 'main' | 'ga-cp',
    toggleCOInputDisable: (input: HTMLInputElement) => void,
    toggleMutTypeDisable?: (input: HTMLInputElement, settings: object) => void,
) {
  let cbEventListener = (ev: Event) => {
    let input = <HTMLInputElement>ev.target;
    let type = input.id.match(/(?<=-)[^-]*$/)[0];

    try {
      settings[input.id.replace(`-${type}`, '')][type] = input.checked;
    } catch (e) {
      console.log('input available but is not registered in settings.json or registered in wrong way');
      console.log(input);
      return;
    }
    if (input.id == 'number-of-1s-enabled' && targetedWindow == 'ga-cp') {
      toggleMutTypeDisable(input, settings);
    }
  };

  let inputEventListener = (ev: Event) => {
    let input = <HTMLInputElement>ev.target;
    try {
      settings[input.id]['value'] = input.value;
    } catch (e) {
      console.log('input available but is not registered in settings.json or registered in wrong way');
      console.log(input);
    }
  };

  let radioEventListener = (ev: KeyboardEvent) => {
    let input = <HTMLInputElement>ev.target;
    try {
      settings[input.name.replace('_', '-')]['value'] = input.value;
    } catch (e) {
      console.log('input available but is not registered in settings.json or registered in wrong way');
      console.log(input);
    }

    if (input.name == 'co_type') toggleCOInputDisable(input)
  };

  Array.from(document.getElementsByTagName('input')).forEach(input => {
    if (input.type == 'radio') {
      input.onchange = radioEventListener;
    } else if (input.type == 'checkbox') input.onchange = cbEventListener;
    else {
      input.onkeyup = inputEventListener;
      if (input.classList.contains('load-path') && targetedWindow == 'ga-cp')
        input.addEventListener('browsedPath', ev => inputEventListener(ev));
      if (input.classList.contains('textfieldable')) input.onchange = inputEventListener;
    }
  });
}

module.exports = saveSettings;
