function affectSettings(settings, window) {
    Array.from(document.getElementsByTagName('input')).forEach(input => {
        if (input.type == 'checkbox') {
            let type = (input.id.match(/(?<=-)[^-]*$/)[0]);
            input.checked = settings[input.id.replace(`-${type}`, '')][type];
            if (input.id == 'force-tf-enabled') {
                Array.from(document.getElementsByClassName('textfieldable')).forEach((textfieldable) => {
                    textfieldable.type = input.checked ? 'text' : 'range';
                });
            }
            else if (window == 'main') {
                if (type == 'pin' || type == 'enabled') {
                    let complexParam = ((type == 'pin'
                        ? input.parentElement.parentElement.parentElement.parentElement
                            .parentElement
                        : input.parentElement));
                    if (!input.checked) {
                        complexParam.classList.add('hide');
                    }
                    else if (type == 'pin' &&
                        (!(complexParam.children.length > 1) ||
                            complexParam.firstElementChild.checked)) {
                        complexParam.classList.remove('hide');
                    }
                }
            }
        }
        else {
            input.value = settings[input.id]['value'];
            if (window == 'main' && settings[input.id]['disable-on-run']) {
                input.classList.add('disable-on-run');
            }
        }
    });
}
module.exports = affectSettings;
//# sourceMappingURL=affect-settings.js.map