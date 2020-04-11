function params() {
    let paramValues = Array.from(document.getElementsByClassName('param-value'));
    paramValues.forEach(paramValue => {
        let input = paramValue.firstElementChild;
        let ArrowsKeys = ['ArrowUp', 'ArrowDown'];
        input.onkeydown = ev => {
            if (ArrowsKeys.includes(ev.key)) {
                ev.preventDefault();
                input.value = ((parseFloat(input.value) || 0) +
                    (ev.ctrlKey ? parseFloat(input.step) * 100 : ev.shiftKey ? parseFloat(input.step) * 10 : parseFloat(input.step)) *
                        (ev.key == 'ArrowUp' ? 1 : -1))
                    .toFixed(Number.isSafeInteger(parseFloat(input.step)) ? 0 : input.step.split('.')[1].length)
                    .toString();
            }
        };
        input.addEventListener('keyup', (ev) => {
            if (ev.key == 'Tab')
                return;
            if (input.checkValidity() &&
                (input.min == '' || parseFloat(input.min) <= parseFloat(input.value)) &&
                (input.max == '' || parseFloat(input.value) <= parseFloat(input.max))) {
                if (!input.classList.replace('invalid', 'valid'))
                    input.classList.add('valid');
            }
            else if (!input.classList.replace('valid', 'invalid')) {
                input.classList.add('invalid');
            }
        });
        input.onblur = () => {
            if (input.value != '')
                return;
            input.classList.remove('valid');
            input.classList.remove('invalid');
        };
        function rangedRandom(min, max, isInt) {
            return (Math.random() * (max - min) + min).toFixed(isInt ? 0 : 3);
        }
        let randomBtn = input.parentElement.nextElementSibling.firstElementChild;
        randomBtn.onclick = () => {
            input.value = rangedRandom(input.max == '' ? parseFloat(input.step) * 1000 : parseFloat(input.max), input.min == '' ? 0 : parseFloat(input.min), Number.isSafeInteger(parseFloat(input.step))).toString();
            if (!input.classList.replace('invalid', 'valid'))
                input.classList.add('valid');
            input.dispatchEvent(new Event('keyup'));
        };
    });
}
module.exports = params;
//# sourceMappingURL=params.js.map