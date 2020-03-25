/**
 * affect given settings to every input on the document.
 *
 * @param settings inputs settings object
 */
function affectSettings(settings: object) {
  Array.from(document.getElementsByTagName('input')).forEach(input => {
    if (input.type == 'checkbox')
      input.checked = settings[input.id.replace('-enabler', '')]['enabled'];
    else if (input.classList.contains('is-disable-able'))
      input.value = settings[input.id]['value'];
    else input.value = settings[input.id];
  });
}

module.exports = affectSettings;
