function saveSettings(settings, targetedWindow, toggleCOInputDisable, toggleMutTypeDisable) {
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
            toggleMutTypeDisable(input, settings);
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
        if (input.name == 'co_type')
            toggleCOInputDisable(input);
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