module.exports = function () {
  // free module from memory if possible after it finishes
  delete require.cache[require.resolve('./border')];

  /**
   * slices 'px' out of min resolution of the given element.
   */
  const pxSlicer = (element: HTMLDivElement, minRes: string) => <any>window.getComputedStyle(element)[minRes].slice(0, -2);

  Array.from(document.getElementsByClassName('border')).forEach((border: HTMLDivElement) => {
    border.appendChild(document.createElement('div'));
    if (!border.classList.contains('resize')) return;
    var prevSib = <HTMLDivElement>border.previousElementSibling,
      nextSib = <HTMLDivElement>border.nextElementSibling;
    var res: string, // width | height          if border is vertical, it's going to work on width, otherwise it's the height.
      minPrevRes: number, // minimal resulotion of the previous sibling in pixel, if mouse descended enaugh the prevSib is going to be hidden.
      minNextRes: number, // minimal resulotion of the next sibling in pixel, if mouse ascended enaugh the nextSib is going to be hidden.
      client: string, // clientX | clientY          if border is vertical, the x value of the mouse is the interest, else it's the y value.
      winRes: string; // innerWidth | innerHeight   the window is set with relative mesures, the width/height needs to be calculated.
    if (border.classList.contains('ver')) {
      res = 'width';
      minPrevRes = pxSlicer(prevSib, 'minWidth');
      minNextRes = pxSlicer(nextSib, 'minWidth');
      client = 'clientX';
      winRes = 'innerWidth';
    } else if (border.classList.contains('hor')) {
      res = 'height';
      minPrevRes = pxSlicer(prevSib, 'minHeight');
      minNextRes = pxSlicer(nextSib, 'minHeight');
      client = 'clientY';
      winRes = 'innerHeight';
    }
    border.onmousedown = () => {
      // shows webviews coverers, to fix the glitch that when resizing
      // the mouse move event is triggered on the webviews instead of the main window
      document.querySelectorAll('.resize-cover').forEach((ele: HTMLDivElement) => ele.classList.remove('hide'));
      window.onmousemove = (e: MouseEvent) => {
        if (e[client] >= minPrevRes && e[client] <= window[winRes] - minNextRes)
          // resizer is just one line, and resizes the container which doesn't have flex: 1 (bottom container is not conuted)
          nextSib.style[res] = window[winRes] - e[client] + 'px';
      };
      window.onmouseup = () => {
        window.onmousemove = window.onmouseup = null;
        document.querySelectorAll('.resize-cover').forEach((ele: HTMLDivElement) => ele.classList.add('hide'));
      };
    };
    // double click will resize middle container to minimum
    border.ondblclick = () => (nextSib.style[res] = minNextRes + 'px');
  });
};
