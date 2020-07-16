function saveSettings(settings, targetedWindow) {
    let cbEventListener = (ev) => {
        let input = ev.target;
        let type = input.id.match(/(?<=-)[^-]*$/)[0];
        try {
            settings[input.id.replace(`-${type}`, '')][type] = input.checked;
        }
        catch (e) {
            console.log('input available but is not registered in settings.json or registered in wrong way');
            console.log(input);
            return;
        }
        if (input.id == 'number-of-1s-enabled' && targetedWindow == 'ga-cp') {
            Array.from(document.getElementsByName('mut-type')).forEach((mutType) => {
                if (input.checked) {
                    mutType.checked = mutType.value == '0';
                    settings['mut-type']['value'] = 0;
                }
                mutType.classList.toggle('forced-disable', mutType.value != '0' && input.checked);
                mutType.disabled = input.checked && 0 < parseInt(mutType.value);
            });
        }
    };
    let inputEventListener = (ev) => {
        let input = ev.target;
        try {
            settings[input.id]['value'] = input.value;
        }
        catch (e) {
            console.log('input available but is not registered in settings.json or registered in wrong way');
            console.log(input);
        }
    };
    let radioEventListener = (ev) => {
        let input = ev.target;
        try {
            settings[input.name.replace('_', '-')]['value'] = input.value;
        }
        catch (e) {
            console.log('input available but is not registered in settings.json or registered in wrong way');
            console.log(input);
        }
        if (input.name != 'co_type')
            return;
        let coRate = document.getElementById('co-rate');
        coRate.disabled = input.value == '2';
        coRate.classList.toggle('disabled', input.value == '2');
        coRate.parentElement.parentElement.title = coRate.disabled ? 'Disabled if crossover type set to Uniform' : '';
        coRate.parentElement.nextElementSibling.firstElementChild.disabled = coRate.disabled;
    };
    Array.from(document.getElementsByTagName('input')).forEach(input => {
        if (input.type == 'radio') {
            input.onchange = radioEventListener;
        }
        else if (input.type == 'checkbox')
            input.onchange = cbEventListener;
        else {
            input.onkeyup = inputEventListener;
            if (input.classList.contains('load-path') && targetedWindow == 'ga-cp')
                input.addEventListener('browsedPath', ev => inputEventListener(ev));
            if (input.classList.contains('textfieldable'))
                input.onchange = inputEventListener;
        }
    });
}
module.exports = saveSettings;
//# sourceMappingURL=save-settings.js.map