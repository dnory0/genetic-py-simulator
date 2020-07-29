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
    let input = <HTMLInputElement>(
      (paramValue.classList.contains('double-sync')
        ? Array.from(paramValue.children).find((ele: HTMLInputElement) => ele.classList.contains('double-sync') && !ele.disabled)
        : paramValue.firstElementChild)
    );
    if (!input.type) return;

    if (input.classList.contains('double-sync') && !input.disabled) {
      if (input.getAttribute('synctype') == 'number-of-1sn0s') {
        const complementaryInput = <HTMLInputElement>input.parentElement.querySelector('input.double-sync:disabled');
        const doubleSyncMaxChangeEventListener = (ev: Event) => {
          let relativeInput = <HTMLInputElement>ev.currentTarget;
          setTimeout(() => {
            let newMax = parseInt(relativeInput.value);
            if (newMax < parseInt(input.value) + 1 || parseInt(input.value) < 1) {
              input.value = (newMax - 1).toString();
              complementaryInput.value = '1';
            } else {
              complementaryInput.value = (newMax - parseInt(input.value)).toString();
            }
            input.max = (newMax - 1).toString();
            input.dispatchEvent(new Event('checkvalidityrequested'));
          }, 0);
        };
        const genesNumInput = document.getElementById('genes-num');

        genesNumInput.addEventListener('keypress', doubleSyncMaxChangeEventListener);
        genesNumInput.addEventListener('keyup', ev => {
          if (['ArrowUp', 'ArrowDown'].includes(ev.key)) doubleSyncMaxChangeEventListener(ev);
        });

        const doubleSyncSyncEventListener = (ev: Event) => {
          let doubleSyncInput = <HTMLInputElement>ev.currentTarget;
          setTimeout(() => {
            complementaryInput.value = (parseInt(doubleSyncInput.max) - parseInt(doubleSyncInput.value) + 1).toString();
          }, 0);
        };

        input.addEventListener('change', doubleSyncSyncEventListener);
        input.addEventListener('keypress', doubleSyncSyncEventListener);
        input.addEventListener('paste', doubleSyncSyncEventListener);
        input.addEventListener('keyup', ev => {
          if (['ArrowUp', 'ArrowDown'].includes(ev.key)) doubleSyncSyncEventListener(ev);
        });
      }
    }

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

    const checkValidityEventListener = (ev: KeyboardEvent) => {
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
    };

    input.addEventListener('keyup', checkValidityEventListener);
    input.addEventListener('checkvalidityrequested', checkValidityEventListener);

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

    if (randomBtn == null) return;

    let isInt = Number.isSafeInteger(parseFloat(input.step));
    randomBtn.onclick = () => {
      let randomizedValue = rangedRandom(
        input.max == '' ? parseFloat(input.step) * 1000 : parseFloat(input.max),
        input.min == '' ? 0 : parseFloat(input.min),
        isInt
      );
      if (input.classList.contains('double-sync')) {
        if (input.max == randomizedValue.toString()) {
          randomizedValue = (parseFloat(randomizedValue) - parseFloat(input.step)).toFixed(isInt ? 0 : 3);
        }
        let complementaryInput = <HTMLInputElement>input.parentElement.querySelector('input.double-sync:disabled');
        complementaryInput.value = (parseFloat(complementaryInput.max) - parseFloat(randomizedValue)).toFixed(isInt ? 0 : 3);
      }
      input.value = randomizedValue;
      if (!(<unknown>input.classList.replace('invalid', 'valid'))) input.classList.add('valid');

      input.dispatchEvent(new Event('keyup'));
    };
  });
}

module.exports = params;
