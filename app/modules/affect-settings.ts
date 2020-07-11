let switchTextfieldable = (textfieldable: HTMLInputElement, forceTFInput: HTMLInputElement) => {
  if (textfieldable.classList.contains('double-sync')) {
    if (!(textfieldable.type == 'range')) return;
    textfieldable.classList.toggle('hide', forceTFInput.checked);
    Array.from(textfieldable.parentElement.children)
      .filter(
        siblingElement =>
          siblingElement.getAttribute('synctype') == textfieldable.getAttribute('synctype') &&
          siblingElement != textfieldable
      )
      .forEach(siblingElement => siblingElement.classList.toggle('hide', !forceTFInput.checked));
  } else {
    textfieldable.type = forceTFInput.checked ? 'text' : 'range';
  }
}

/**
 * affect given settings to every input on the document.
 *
 * @param settings inputs settings object
 * @param targetedWindow targeted window: ```main``` | ```ga-cp```
 */
function affectSettings(settings: object, targetedWindow: 'main' | 'ga-cp') {
  Array.from(document.getElementsByTagName('input')).forEach((input, _, inputs) => {
    if (input.type == 'checkbox') {
      let type: 'enabled' | 'pin' = <'enabled' | 'pin'>input.id.match(/(?<=-)[^-]*$/)[0];
      try {
        input.checked = settings[input.id.replace(`-${type}`, '')][type];
      } catch (e) {
        console.log(`This should be a new input, add it to settings.json`);
        console.log(input);
        return;
      }

      if (input.id == 'force-tf-enabled') {
        inputs.filter(textfieldable => textfieldable.classList.contains('textfieldable')).forEach((textfieldable: HTMLInputElement) => {
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
      if (settings[input.name.replace('_', '-')]['value'] != input.value) return;
      input.checked = true;

      if (input.name != 'co_type') return;
      let coRate = <HTMLInputElement>document.getElementById('co-rate');
      coRate.disabled = input.value == '2';
      coRate.classList.toggle('disabled', input.value == '2');
      coRate.parentElement.parentElement.title = coRate.disabled ? 'Disabled if crossover type set to Uniform' : '';
      (<HTMLButtonElement>coRate.parentElement.nextElementSibling.firstElementChild).disabled = coRate.disabled;
    } else {
      try {
        input.value = settings[input.id]['value'];
        if (targetedWindow == 'main' && settings[input.id]['disable-on-run']) {
          input.classList.add('disable-on-run');
        }
      } catch (e) {
        console.log(`This should be a new input, add it to settings.json`);
        console.log(input);
      }
    }
  });
}

module.exports = affectSettings;
