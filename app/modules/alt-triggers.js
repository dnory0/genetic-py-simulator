function altTriggers() {
    let altTriggerers = (Array.from(document.getElementsByClassName('alt-trigger')));
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
                btn = (altTriggerers.find(altTrigger => altTrigger.innerText.toLowerCase() == ev.key).parentElement);
                if (!btn.disabled)
                    btn.classList.add('alt-pressed');
            }
        }
    };
    function altTriggerAction(button) {
        if (button.disabled)
            return;
        button.classList.remove('alt-pressed');
        button.click();
    }
    window.onkeyup = (ev) => {
        if (ev.key == 'Alt') {
            altTriggerers.forEach(altTrigger => {
                if (!altTrigger.parentElement.disabled)
                    altTrigger.style.textDecoration = 'none';
            });
        }
        else if (ev.altKey) {
            let altTriggered = altTriggerers.find(altTrigger => altTrigger.innerText.toLowerCase() == ev.key);
            if (altTriggered)
                altTriggerAction(altTriggered.parentElement);
        }
    };
}
module.exports = altTriggers;
//# sourceMappingURL=alt-triggers.js.map