function saveSettings(settings) {
    let cbEventListener = (ev) => {
        let input = ev.target;
        let type = input.id.match(/(?<=-)[^-]*$/)[0];
        settings[input.id.replace(`-${type}`, '')][type] = input.checked;
    };
    let inputEventListener = (ev) => {
        let input = ev.target;
        settings[input.id]['value'] = input.value;
    };
    let radioEventListener = (ev) => {
        let input = ev.target;
        settings[input.name.replace('_', '-')]['value'] = input.value;
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
            if (input.classList.contains('load-path') && input['isGACP'])
                input.addEventListener('browsedPath', ev => inputEventListener(ev));
            if (input.classList.contains('textfieldable'))
                input.onchange = inputEventListener;
        }
    });
}
module.exports = saveSettings;
//# sourceMappingURL=save-settings.js.map