function affectSettings(settings) {
    Array.from(document.getElementsByTagName('input')).forEach(input => {
        if (input.type == 'checkbox')
            input.checked = settings[input.id.replace('-enabler', '')]['enabled'];
        else if (input.classList.contains('is-disable-able'))
            input.value = settings[input.id]['value'];
        else
            input.value = settings[input.id];
    });
}
module.exports = affectSettings;
//# sourceMappingURL=affect-settings.js.map