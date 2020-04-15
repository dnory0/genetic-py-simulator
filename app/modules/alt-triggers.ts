/**
 * whenever the user presses the alt key, span elements with the class "alt-trigger"
 * are going to be underlined indicating that pressing the span's letter while holding
 * the altKey is going to trigger the parent on click event, the .alt-pressed class
 * of the parent element is also triggered and used to simulate the on pressed event.
 *
 * **Note:**
 *  - this works with only few elements, noting labels and buttons.
 *  - spans should only contain one letter (uppercase or lowercase does not matter).
 *  - a letter used as an alt trigger should not be repeated in the same window object.
 */
function altTriggers() {
  let altTriggerers = <HTMLSpanElement[]>Array.from(document.getElementsByClassName('alt-trigger'));

  window.onkeydown = (ev: KeyboardEvent) => {
    if (ev.key == 'Alt') {
      altTriggerers.forEach(altTrigger => {
        if (!(<HTMLButtonElement>altTrigger.parentElement).disabled) altTrigger.style.textDecoration = 'underline';
      });
    } else if (ev.altKey) {
      var btn: HTMLButtonElement;

      let altTriggered = altTriggerers.find(altTrigger => altTrigger.innerText.toLowerCase() == ev.key);

      if (altTriggered) {
        btn = <HTMLButtonElement>altTriggerers.find(altTrigger => altTrigger.innerText.toLowerCase() == ev.key).parentElement;

        if (!btn.disabled) btn.classList.add('alt-pressed');
      }
    }
  };

  /**
   * trigger the onclick event of the button that the key given matches the button first letter
   * and remove the pressed style if button is not disabled.
   * @param key pressed keyboard key that should match on of the altTriggers.
   */
  function altTriggerAction(key: string) {
    let altTriggered = altTriggerers.filter(altTrigger => altTrigger.innerText.toLowerCase() == key);
    if (!altTriggered.length) return;
    let button: HTMLButtonElement = <HTMLButtonElement>altTriggered[0].parentElement;
    if (button.disabled) return;
    button.classList.remove('alt-pressed');
    button.click();
  }

  /**
   * removes all underlines from altTriggers
   */
  let rmAllUnderLines = () => altTriggerers.forEach(altTrigger => (altTrigger.style.textDecoration = 'none'));

  window.onkeyup = (ev: KeyboardEvent) => {
    if (ev.key == 'Alt') rmAllUnderLines();
    else if (ev.altKey) altTriggerAction(ev.key);
  };

  window.addEventListener('blur', rmAllUnderLines);
}

module.exports = altTriggers;
