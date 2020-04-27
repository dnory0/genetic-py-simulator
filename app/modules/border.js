module.exports = function () {
    delete require.cache[require.resolve('./border')];
    const pxSlicer = (element, minRes) => window.getComputedStyle(element)[minRes].slice(0, -2);
    Array.from(document.getElementsByClassName('border')).forEach((border) => {
        border.appendChild(document.createElement('div'));
        if (!border.classList.contains('resize'))
            return;
        var prevSib = border.previousElementSibling, nextSib = border.nextElementSibling;
        var res, minPrevRes, minNextRes, client, winRes;
        if (border.classList.contains('ver')) {
            res = 'width';
            minPrevRes = pxSlicer(prevSib, 'minWidth');
            minNextRes = pxSlicer(nextSib, 'minWidth');
            client = 'clientX';
            winRes = 'innerWidth';
        }
        else if (border.classList.contains('hor')) {
            res = 'height';
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
                    nextSib.style[res] = window[winRes] - 24 - e[client] + 'px';
            };
            window.onmouseup = () => {
                window.onmousemove = window.onmouseup = null;
                document
                    .querySelectorAll('.resize-cover')
                    .forEach((ele) => ele.classList.add('hide'));
            };
        };
        border.ondblclick = () => (nextSib.style[res] = minNextRes + 'px');
    });
};
//# sourceMappingURL=border.js.map