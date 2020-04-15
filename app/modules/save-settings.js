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
    Array.from(document.getElementsByTagName('input')).forEach(input => {
        if (input.type == 'checkbox')
            input.onchange = cbEventListener;
        else {
            input.onkeyup = inputEventListener;
            if (input.classList.contains('textfieldable'))
                input.onchange = inputEventListener;
        }
    });
}
module.exports = saveSettings;
//# sourceMappingURL=save-settings.js.map