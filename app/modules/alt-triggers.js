function altTriggers() {
    let altTriggerers = Array.from(document.getElementsByClassName('alt-trigger'));
    window.onkeydown = (ev) => {
        if (ev.key == 'Alt') {
            altTriggerers.forEach(altTrigger => {
                if (!altTrigger.parentElement.disabled)
                    altTrigger.style.textDecoration = 'underline';
            });
        }
        else if (ev.altKey) {
            var btn;
            let altTriggered = altTriggerers.find(altTrigger => altTrigger.innerText.toLowerCase() == ev.key);
            if (altTriggered) {
                btn = altTriggerers.find(altTrigger => altTrigger.innerText.toLowerCase() == ev.key).parentElement;
                if (!btn.disabled)
                    btn.classList.add('alt-pressed');
            }
        }
    };
    function altTriggerAction(key) {
        let altTriggered = altTriggerers.filter(altTrigger => altTrigger.innerText.toLowerCase() == key);
        if (!altTriggered.length)
            return;
        let button = altTriggered[0].parentElement;
        if (button.disabled)
            return;
        button.classList.remove('alt-pressed');
        button.click();
    }
    let rmAllUnderLines = () => altTriggerers.forEach(altTrigger => (altTrigger.style.textDecoration = 'none'));
    window.onkeyup = (ev) => {
        if (ev.key == 'Alt')
            rmAllUnderLines();
        else if (ev.altKey)
            altTriggerAction(ev.key);
    };
    window.addEventListener('blur', rmAllUnderLines);
}
module.exports = altTriggers;
//# sourceMappingURL=alt-triggers.js.map