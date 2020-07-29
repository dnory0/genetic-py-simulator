// TODO: test this module
function tabTriggers() {
  Array.from(document.getElementsByTagName('input')).forEach(
    (input, _i, inputs) => {
      input.addEventListener('keyup', ev => {
        if (ev.key == 'Tab') {
          inputs.forEach(otherInput => {
            otherInput.classList.add('tab-triggered');
          });
          let eventListener = () => {
            inputs.forEach(otherInput => {
              otherInput.classList.remove('tab-triggered');
            });
            window.removeEventListener('mousedown', eventListener);
          };
          window.addEventListener('mousedown', eventListener);
        }
      });
    }
  );
}

module.exports = tabTriggers;
