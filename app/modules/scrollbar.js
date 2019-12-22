module.exports = function (scrollConts) {
    require.cache['./scrollbar'];
    Array.from(scrollConts).forEach((scrollCont) => {
        let fChild = scrollCont.firstElementChild;
        let nextSib = scrollCont.nextElementSibling;
        fChild.onscroll = ev => {
            var isNextSib = ev.target.classList.contains('scrolling-content');
            (isNextSib ? fChild : nextSib).scrollTo({
                top: isNextSib ? nextSib.scrollTop : fChild.scrollTop
            });
        };
        scrollCont.onmouseover = scrollCont.onmouseleave = (ev) => (fChild.style.marginRight = ev.type == 'mouseover' ? '0' : '-12px');
    });
};
//# sourceMappingURL=scrollbar.js.map