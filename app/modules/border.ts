module.exports = function() {
  // free module from memory if possible
  delete require.cache[require.resolve('./border')];

  /**
   * slices 'px' out of min resolution of the given element.
   */
  const pxSlicer = (element: HTMLDivElement, minRes: string) =>
    <any>window.getComputedStyle(element)[minRes].slice(0, -2);

  Array.from(document.getElementsByClassName('border')).forEach(
    (border: HTMLDivElement) => {
      var prevSib = <HTMLDivElement>border.previousElementSibling,
        nextSib = <HTMLDivElement>border.nextElementSibling,
        prevDisp = prevSib.style.display,
        nextDisp = nextSib.style.display;
      var prevRes: string, // width | height          if border is vertical, it's going to work on width, otherwise it's the height.
        minPrevRes: number, // minimal resulotion of the previous sibling in pixel, if mouse descended enaugh the prevSib is going to be hidden.
        minNextRes: number, // minimal resulotion of the next sibling in pixel, if mouse ascended enaugh the nextSib is going to be hidden.
        client: string, // clientX | clientY          if border is vertical, the x value of the mouse is the interest, else it's the y value.
        winRes: string; // innerWidth | innerHeight   the window is set with relative mesures, the width/height needs to be calculated.
      if (border.classList.contains('ver')) {
        prevRes = 'width';
        minPrevRes = pxSlicer(prevSib, 'minWidth');
        minNextRes = pxSlicer(nextSib, 'minWidth');
        client = 'clientX';
        winRes = 'innerWidth';
      } else if (border.classList.contains('hor')) {
        prevRes = 'height';
        minPrevRes = pxSlicer(prevSib, 'minHeight');
        minNextRes = pxSlicer(nextSib, 'minHeight');
        client = 'clientY';
        winRes = 'innerHeight';
      }
      border.onmousedown = () => {
        // shows webviews coverers, to fix the glitch that when resizing
        // the mouse move event is triggered on the webviews instead of the main window
        document
          .querySelectorAll('.resize-cover')
          .forEach((ele: HTMLDivElement) => (ele.style.display = 'block'));
        window.onmousemove = (e: MouseEvent) => {
          //  resizes only and no hiding and showing
          if (
            e[client] >= minPrevRes &&
            e[client] <= window[winRes] - minNextRes
          )
            prevSib.style[prevRes] = e[client] + 'px';
          // hider and shower of the previous div
          else if (e[client] < minPrevRes) {
            if (e[client] < 100) {
              border.style.padding = '0 4px 4px 0';
              border.style.margin = '-1px';
              prevSib.style.display = 'none';
            } else if (e[client] >= 100)
              if (prevSib.style.display == 'none') {
                border.style.padding = '';
                border.style.margin = '';
                prevSib.style.display = prevDisp;
              }
          }
          // hider and shower of the next div
          else {
            if (window[winRes] - e[client] < 100) {
              if (nextSib.style.display != 'none') {
                border.style.margin = '-1px';
                border.style.padding = '4px 0 0 4px';
                nextSib.style.display = 'none';
                prevSib.style.flex = '1';
              }
            } else if (window[winRes] - e[client] >= 100) {
              if (nextSib.style.display == 'none') {
                border.style.padding = '';
                border.style.margin = '';
                nextSib.style.display = nextDisp;
                prevSib.style.flex = 'unset';
              }
            }
          }
        };
        window.onmouseup = () => {
          window.onmousemove = window.onmouseup = null;
          document
            .querySelectorAll('.resize-cover')
            .forEach((ele: HTMLDivElement) => (ele.style.display = 'none'));
        };
      };
    }
  );
};
