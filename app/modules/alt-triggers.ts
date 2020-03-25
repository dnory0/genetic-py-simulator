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
  let altTriggerers = <HTMLSpanElement[]>(
    Array.from(document.getElementsByClassName('alt-trigger'))
  );

  window.onkeydown = (ev: KeyboardEvent) => {
    if (ev.key == 'Alt') {
      altTriggerers.forEach(altTrigger => {
        if (!(<HTMLButtonElement>altTrigger.parentElement).disabled)
          altTrigger.style.textDecoration = 'underline';
      });
    } else if (ev.altKey) {
      var btn: HTMLButtonElement;

      let altTriggered = altTriggerers.find(
        altTrigger => altTrigger.innerText.toLowerCase() == ev.key
      );

      if (altTriggered) {
        btn = <HTMLButtonElement>(
          altTriggerers.find(
            altTrigger => altTrigger.innerText.toLowerCase() == ev.key
          ).parentElement
        );

        if (!btn.disabled) btn.classList.add('alt-pressed');
      }
    }
  };

  /**
   * trigger the onclick event of the given button and remove the pressed style if
   * button is not disabled.
   * @param button button that can be triggered by pressing alt key on keyboard.
   */
  function altTriggerAction(button: HTMLButtonElement) {
    if (button.disabled) return;
    button.classList.remove('alt-pressed');
    button.click();
  }

  window.onkeyup = (ev: KeyboardEvent) => {
    if (ev.key == 'Alt') {
      altTriggerers.forEach(altTrigger => {
        if (!(<HTMLButtonElement>altTrigger.parentElement).disabled)
          altTrigger.style.textDecoration = 'none';
      });
    } else if (ev.altKey) {
      let altTriggered = altTriggerers.find(
        altTrigger => altTrigger.innerText.toLowerCase() == ev.key
      );
      if (altTriggered)
        altTriggerAction(<HTMLButtonElement>altTriggered.parentElement);
    }
  };
}

module.exports = altTriggers;
