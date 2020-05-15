function affectSettings(settings, targetedWindow) {
    Array.from(document.getElementsByTagName('input')).forEach(input => {
        if (input.type == 'checkbox') {
            let type = input.id.match(/(?<=-)[^-]*$/)[0];
            input.checked = settings[input.id.replace(`-${type}`, '')][type];
            if (input.id == 'force-tf-enabled') {
                Array.from(document.getElementsByClassName('textfieldable')).forEach((textfieldable) => {
                    textfieldable.type = input.checked ? 'text' : 'range';
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
            input.value = settings[input.id]['value'];
            if (targetedWindow == 'main' && settings[input.id]['disable-on-run']) {
                input.classList.add('disable-on-run');
            }
        }
    });
}
module.exports = affectSettings;
//# sourceMappingURL=affect-settings.js.map