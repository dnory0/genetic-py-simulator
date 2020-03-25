/**
 * add the ability to autosave onto the given settings every time the input changes value.
 *
 * @param settings inputs settings object
 */
function saveSettings(settings: object) {
  let cbEventListener = (ev: Event) => {
    settings[(<HTMLInputElement>ev.target).id.replace('-enabler', '')][
      'enabled'
    ] = (<HTMLInputElement>ev.target).checked;
    console.log('hi');
  };

  let inputEventListener = (ev: KeyboardEvent) => {
    settings[(<HTMLInputElement>ev.target).id] = (<HTMLInputElement>(
      ev.target
    )).value;
    console.log('hi');
  };

  let disableAbleEventListener = (ev: Event) => {
    settings[(<HTMLInputElement>ev.target).id]['value'] = (<HTMLInputElement>(
      ev.target
    )).value;
    console.log('hi');
  };

  Array.from(document.getElementsByTagName('input')).forEach(input => {
    if (input.type == 'checkbox') input.onchange = cbEventListener;
    else if (input.classList.contains('is-disable-able')) {
      input.onkeyup = disableAbleEventListener;
      if (input.classList.contains('textfieldable'))
        input.onchange = disableAbleEventListener;
    } else {
      input.onkeyup = inputEventListener;
      if (input.classList.contains('textfieldable'))
        input.onchange = inputEventListener;
    }
  });
}

module.exports = saveSettings;
