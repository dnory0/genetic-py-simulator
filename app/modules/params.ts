/**
 * setup params:
 *  - values to have the ability to increment and decrement using arrows keys.
 *  - values to respond to ctrl/shift + arrowup/arrowdown.
 *  - values to check validity onkeyup.
 *  - values to remove invalid class on blur(unfocus) if empty.
 *  - random buttons function and give random values for the param value range.
 */
function params() {
  let paramValues = <HTMLDivElement[]>Array.from(document.getElementsByClassName('param-value'));

  paramValues.forEach(paramValue => {
    let input = <HTMLInputElement>paramValue.firstElementChild;

    let ArrowsKeys = ['ArrowUp', 'ArrowDown'];

    input.onkeydown = ev => {
      if (ArrowsKeys.includes(ev.key)) {
        ev.preventDefault();

        input.value = (
          (parseFloat(input.value) || 0) +
          (ev.ctrlKey ? parseFloat(input.step) * 100 : ev.shiftKey ? parseFloat(input.step) * 10 : parseFloat(input.step)) *
            (ev.key == 'ArrowUp' ? 1 : -1)
        )
          .toFixed(Number.isSafeInteger(parseFloat(input.step)) ? 0 : input.step.split('.')[1].length)
          .toString();
      }
    };

    input.addEventListener('keyup', (ev: KeyboardEvent) => {
      if (ev.key == 'Tab') return;
      if (
        input.checkValidity() &&
        (input.min == '' || parseFloat(input.min) <= parseFloat(input.value)) &&
        (input.max == '' || parseFloat(input.value) <= parseFloat(input.max))
      ) {
        if (!(<unknown>input.classList.replace('invalid', 'valid'))) input.classList.add('valid');
      } else if (!(<unknown>input.classList.replace('valid', 'invalid'))) {
        input.classList.add('invalid');
      }
    });

    input.onblur = () => {
      if (input.value != '') return;
      input.classList.remove('valid');
      input.classList.remove('invalid');
    };

    /**
     *
     * @param min minimum value
     * @param max maximum value
     * @param isInt if true, number is sent without float point
     */
    function rangedRandom(min: number, max: number, isInt: boolean) {
      return (Math.random() * (max - min) + min).toFixed(isInt ? 0 : 3);
    }

    let randomBtn = <HTMLButtonElement>input.parentElement.nextElementSibling.firstElementChild;

    randomBtn.onclick = () => {
      input.value = rangedRandom(
        input.max == '' ? parseFloat(input.step) * 1000 : parseFloat(input.max),
        input.min == '' ? 0 : parseFloat(input.min),
        Number.isSafeInteger(parseFloat(input.step))
      ).toString();

      if (!(<unknown>input.classList.replace('invalid', 'valid'))) input.classList.add('valid');

      input.dispatchEvent(new Event('keyup'));
    };
  });
}

module.exports = params;
