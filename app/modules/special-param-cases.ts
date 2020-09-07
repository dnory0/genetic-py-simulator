module.exports.toggleMutTypeDisable = function(input: HTMLInputElement, settings: object) {
  Array.from(document.getElementsByName('mut-type')).forEach((mutType: HTMLInputElement) => {
    if (input.checked) {
      mutType.checked = mutType.value == '0';
      settings['mut-type']['value'] = 0;
    }
    mutType.classList.toggle('forced-disable', input.checked && mutType.value != '0');
    mutType.disabled = input.checked && 0 < parseInt(mutType.value);
});
}

module.exports.toggleCOInputDisable = function(input: HTMLInputElement) {
  let coRate = <HTMLInputElement>document.getElementById('co-rate');
  coRate.disabled = input.value == '2';
  coRate.classList.toggle('disabled', input.value == '2');
  coRate.parentElement.parentElement.title = coRate.disabled ? 'Disabled if crossover type set to Uniform' : '';
  (<HTMLButtonElement>coRate.parentElement.nextElementSibling.firstElementChild).disabled = coRate.disabled;
}
