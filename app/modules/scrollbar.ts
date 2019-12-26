module.exports = function() {
  delete require.cache[require.resolve('./scrollbar')];
  Array.from(document.getElementsByClassName('scrollbar')).forEach(
    (scrollbar: HTMLDivElement) => {
      // content that is going to have this scrollbar.
      let scrollingContent = <HTMLDivElement>scrollbar.nextElementSibling;
      // container that's going right and left to simulate stretching of the menubar.
      let transitionedScrollbar = document.createElement('div');
      // container that's going to stretch over the tranistionedScrollbar to create
      // its menubar.
      let scrollbarContent = document.createElement('div');

      // to make scrolling-content scrollable
      scrollbar.parentElement.style.height = '100%';

      transitionedScrollbar.classList.add('transitioned-scrollbar');
      scrollbar.appendChild(transitionedScrollbar);
      scrollbarContent.classList.add('scrollbar-content');
      scrollbarContent.style.height =
        (<HTMLDivElement>scrollingContent.firstElementChild).offsetHeight +
        'px';
      transitionedScrollbar.appendChild(scrollbarContent);
      transitionedScrollbar.onscroll = scrollingContent.onscroll = ev => {
        var isNextSib = (<HTMLDivElement>ev.target).classList.contains(
          'scrolling-content'
        );
        (isNextSib ? transitionedScrollbar : scrollingContent).scrollTo({
          top: isNextSib
            ? scrollingContent.scrollTop
            : transitionedScrollbar.scrollTop
        });
      };

      scrollbar.onmouseover = scrollbar.onmouseleave = (ev: MouseEvent) =>
        (transitionedScrollbar.style.marginRight =
          ev.type == 'mouseover' ? '0' : '-12px');
    }
  );
};
