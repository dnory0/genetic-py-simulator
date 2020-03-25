function saveSettings(settings) {
    let cbEventListener = (ev) => {
        settings[ev.target.id.replace('-enabler', '')]['enabled'] = ev.target.checked;
        console.log('hi');
    };
    let inputEventListener = (ev) => {
        settings[ev.target.id] = (ev.target).value;
        console.log('hi');
    };
    let disableAbleEventListener = (ev) => {
        settings[ev.target.id]['value'] = (ev.target).value;
        console.log('hi');
    };
    Array.from(document.getElementsByTagName('input')).forEach(input => {
        if (input.type == 'checkbox')
            input.onchange = cbEventListener;
        else if (input.classList.contains('is-disable-able')) {
            input.onkeyup = disableAbleEventListener;
            if (input.classList.contains('textfieldable'))
                input.onchange = disableAbleEventListener;
        }
        else {
            input.onkeyup = inputEventListener;
            if (input.classList.contains('textfieldable'))
                input.onchange = inputEventListener;
        }
    });
}
module.exports = saveSettings;
//# sourceMappingURL=save-settings.js.map