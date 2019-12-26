module.exports = function () {
    delete require.cache[require.resolve('./scrollbar')];
    Array.from(document.getElementsByClassName('scrollbar')).forEach((scrollbar) => {
        let scrollingContent = scrollbar.nextElementSibling;
        let transitionedScrollbar = document.createElement('div');
        let scrollbarContent = document.createElement('div');
        scrollbar.parentElement.style.height = '100%';
        transitionedScrollbar.classList.add('transitioned-scrollbar');
        scrollbar.appendChild(transitionedScrollbar);
        scrollbarContent.classList.add('scrollbar-content');
        scrollbarContent.style.height =
            scrollingContent.firstElementChild.offsetHeight +
                'px';
        transitionedScrollbar.appendChild(scrollbarContent);
        transitionedScrollbar.onscroll = scrollingContent.onscroll = ev => {
            var isNextSib = ev.target.classList.contains('scrolling-content');
            (isNextSib ? transitionedScrollbar : scrollingContent).scrollTo({
                top: isNextSib
                    ? scrollingContent.scrollTop
                    : transitionedScrollbar.scrollTop
            });
        };
        scrollbar.onmouseover = scrollbar.onmouseleave = (ev) => (transitionedScrollbar.style.marginRight =
            ev.type == 'mouseover' ? '0' : '-12px');
    });
};
//# sourceMappingURL=scrollbar.js.map