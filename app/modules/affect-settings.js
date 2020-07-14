let switchTextfieldable = (textfieldable, forceTFInput) => {
    if (textfieldable.classList.contains('double-sync')) {
        if (textfieldable.disabled) {
            textfieldable.classList.toggle('hide', !forceTFInput.checked);
            return;
        }
        textfieldable.previousElementSibling.classList.toggle('hide', !forceTFInput.checked);
        textfieldable.nextElementSibling.classList.toggle('hide', forceTFInput.checked);
    }
    textfieldable.type = forceTFInput.checked ? 'text' : 'range';
};
function affectSettings(settings, targetedWindow) {
    Array.from(document.getElementsByTagName('input')).forEach((input, _, inputs) => {
        if (input.type == 'checkbox') {
            let type = input.id.match(/(?<=-)[^-]*$/)[0];
            try {
                input.checked = settings[input.id.replace(`-${type}`, '')][type];
            }
            catch (e) {
                console.log(`This should be a new input, add it to settings.json`);
                console.log(input);
                return;
            }
            if (input.id == 'force-tf-enabled') {
                inputs
                    .filter(textfieldable => textfieldable.classList.contains('textfieldable'))
                    .forEach((textfieldable) => {
                    if (targetedWindow == 'ga-cp')
                        textfieldable['switchTextfieldable'] = () => switchTextfieldable(textfieldable, input);
                    switchTextfieldable(textfieldable, input);
                });
            }
            else if (targetedWindow == 'main') {
                if ((type == 'pin' || type == 'enabled') && input.id != 'lr-enabled') {
                    let complexParam = ((type == 'pin' ? input.parentElement.parentElement.parentElement.parentElement.parentElement : input.parentElement));
                    if (!input.checked) {
                        complexParam.classList.add('hide');
                    }
                    else if (type == 'pin' &&
                        (!(complexParam.children.length > 1) || complexParam.firstElementChild.checked)) {
                        complexParam.classList.remove('hide');
                    }
                }
            }
        }
        else if (input.type == 'radio') {
            if (settings[input.name.replace('_', '-')]['value'] != input.value)
                return;
            input.checked = true;
            if (input.name != 'co_type')
                return;
            let coRate = document.getElementById('co-rate');
            coRate.disabled = input.value == '2';
            coRate.classList.toggle('disabled', input.value == '2');
            coRate.parentElement.parentElement.title = coRate.disabled ? 'Disabled if crossover type set to Uniform' : '';
            coRate.parentElement.nextElementSibling.firstElementChild.disabled = coRate.disabled;
        }
        else {
            if (input.classList.contains('double-sync')) {
                if (input.getAttribute('synctype') == 'number-of-1sn0s') {
                    input.max = (parseInt(document.getElementById('genes-num').value) - 1).toString();
                }
            }
            try {
                if (input.classList.contains('double-sync') && input.disabled) {
                    if (input.getAttribute('synctype') == 'number-of-1sn0s') {
                        input.value = (parseInt(input.max) + 1 - settings['number-of-1s']['value']).toString();
                    }
                }
                else {
                    input.value = settings[input.id]['value'];
                }
            }
            catch (e) {
                console.log(`This should be a new input, add it to settings.json`);
                console.log(input);
            }
        }
    });
}
module.exports = affectSettings;
//# sourceMappingURL=affect-settings.js.map