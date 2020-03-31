module.exports = function () {
    delete require.cache[require.resolve('./border')];
    const pxSlicer = (element, minRes) => window.getComputedStyle(element)[minRes].slice(0, -2);
    Array.from(document.getElementsByClassName('border')).forEach((border) => {
        if (!border.classList.contains('resize'))
            return;
        var prevSib = border.previousElementSibling, nextSib = border.nextElementSibling, prevDisp = prevSib.style.display, nextDisp = nextSib.style.display;
        var prevRes, minPrevRes, minNextRes, client, winRes;
        if (border.classList.contains('ver')) {
            prevRes = 'width';
            minPrevRes = pxSlicer(prevSib, 'minWidth');
            minNextRes = pxSlicer(nextSib, 'minWidth');
            client = 'clientX';
            winRes = 'innerWidth';
        }
        else if (border.classList.contains('hor')) {
            prevRes = 'height';
            minPrevRes = pxSlicer(prevSib, 'minHeight');
            minNextRes = pxSlicer(nextSib, 'minHeight');
            client = 'clientY';
            winRes = 'innerHeight';
        }
        border.onmousedown = () => {
            document
                .querySelectorAll('.resize-cover')
                .forEach((ele) => ele.classList.remove('hide'));
            window.onmousemove = (e) => {
                if (e[client] >= minPrevRes &&
                    e[client] <= window[winRes] - minNextRes)
                    prevSib.style[prevRes] = e[client] + 'px';
                else if (e[client] < minPrevRes) {
                    if (e[client] < 100) {
                        border.style.padding = '0 4px 4px 0';
                        border.style.margin = '-1px';
                        prevSib.style.display = 'none';
                    }
                    else if (e[client] >= 100)
                        if (prevSib.style.display == 'none') {
                            border.style.padding = '';
                            border.style.margin = '';
                            prevSib.style.display = prevDisp;
                        }
                }
                else {
                    if (window[winRes] - e[client] < 100) {
                        if (nextSib.style.display != 'none') {
                            border.style.margin = '-1px';
                            border.style.padding = '4px 0 0 4px';
                            nextSib.style.display = 'none';
                            prevSib.style.flex = '1';
                        }
                    }
                    else if (window[winRes] - e[client] >= 100) {
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
                    .forEach((ele) => ele.classList.add('hide'));
            };
        };
    });
};
//# sourceMappingURL=border.js.map