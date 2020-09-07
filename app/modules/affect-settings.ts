let switchTextfieldable = (textfieldable: HTMLInputElement, forceTFInput: HTMLInputElement) => {
  // additional changes to be made when toggling double-sync inputs
  if (textfieldable.classList.contains('double-sync')) {
    if (!textfieldable.classList.contains('main-double-sync')) {
      textfieldable.classList.toggle('hide', !forceTFInput.checked);
      return;
    }
    textfieldable.previousElementSibling.classList.toggle('hide', !forceTFInput.checked);
    textfieldable.nextElementSibling.classList.toggle('hide', forceTFInput.checked);
  }
  textfieldable.type = forceTFInput.checked ? 'text' : 'range';
};

/**
 * affect given settings to every input on the document.
 *
 * @param settings inputs settings object
 * @param targetedWindow targeted window: ```main``` | ```ga-cp```
 * @param toggleCOInputDisable disable crossover input if crossover type is 2 (Uniform) which does not require a value
 * @param toggleMutTypeDisable <ga-cp only> disable mutation type incompatible labels when number of 1s input is checked
 */
function affectSettings(
  settings: object,
  targetedWindow: 'main' | 'ga-cp',
  toggleCOInputDisable: (input: HTMLInputElement) => void,
  toggleMutTypeDisable?: (input: HTMLInputElement, settings: object) => void
) {
  Array.from(document.getElementsByTagName('input')).forEach((input, _, inputs) => {
    if (input.type == 'checkbox') {
      let type = <'enabled' | 'pin'>input.id.match(/(?<=-)[^-]*$/)[0];
      try {
        input.checked = settings[input.id.replace(`-${type}`, '')][type];
      } catch (e) {
        console.log(`This should be a new input, add it to settings.json`);
        console.log(input);
        return;
      }
      if (input.id == 'number-of-1s-enabled' && targetedWindow == 'ga-cp') {
        toggleMutTypeDisable(input, settings);
      }

      if (input.id == 'force-tf-enabled') {
        inputs
          .filter(textfieldable => textfieldable.classList.contains('textfieldable'))
          .forEach((textfieldable: HTMLInputElement) => {
            if (targetedWindow == 'ga-cp') textfieldable['switchTextfieldable'] = () => switchTextfieldable(textfieldable, input);
            switchTextfieldable(textfieldable, input);
          });
      } else if (targetedWindow == 'main') {
        if ((type == 'pin' || type == 'enabled') && input.id != 'lr-enabled') {
          let complexParam = <HTMLDivElement>(
            (type == 'pin' ? input.parentElement.parentElement.parentElement.parentElement.parentElement : input.parentElement)
          );

          if (!input.checked) {
            complexParam.classList.add('hide');
          } else if (
            type == 'pin' &&
            (!(complexParam.children.length > 1) || (<HTMLInputElement>complexParam.firstElementChild).checked)
          ) {
            complexParam.classList.remove('hide');
          }
        }
      }
    } else if (input.type == 'radio') {
      try {
        if (settings[input.name.replace('_', '-')]['value'] != input.value) return;
      } catch (e) {
        console.log('input available but is not registered in settings.json or registered in wrong way');
        console.log(input);
      }

      input.checked = true;

      if (input.name == 'co_type') toggleCOInputDisable(input);
    } else {
      if (input.classList.contains('double-sync')) {
        if (input.getAttribute('synctype') == 'number-of-1sn0s') {
          input.max = (parseInt((<HTMLInputElement>document.getElementById('genes-num')).value) - 1).toString();
        }
      }
      try {
        if (input.classList.contains('double-sync') && input.disabled) {
          if (input.getAttribute('synctype') == 'number-of-1sn0s') {
            input.value = (parseInt(input.max) + 1 - settings['number-of-1s']['value']).toString();
          }
        } else {
          input.value = settings[input.id]['value'];
        }
      } catch (e) {
        console.log(`This should be a new input, add it to settings.json`);
        console.log(input);
      }
      if (input.classList.contains('load-path') && targetedWindow == 'main') {
      }
    }
  });
}

module.exports = affectSettings;
