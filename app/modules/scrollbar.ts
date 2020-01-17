/**
 * scrollbar fn adds a scrollbar to every ```<div class="scrollbar"></div>```
 */
function scrollbar() {
  // free module from memory if possible after it finishes
  delete require.cache[require.resolve('./scrollbar')];

  Array.from(document.getElementsByClassName('scrollbar')).forEach(
    (scrollbar: HTMLDivElement) => {
      // content that is going to have this scrollbar.
      var scrollingContent = <HTMLDivElement>scrollbar.nextElementSibling;
      // container that's going right and left to simulate stretching of the menubar.
      var transitionedScrollbar = document.createElement('div');
      // container that's going to stretch over the tranistionedScrollbar to create
      // its menubar.
      var scrollbarContent = document.createElement('div');

      // limiting parent height present an overflow which makes scrolling-content scrollable
      scrollbar.parentElement.style.height = '100%';

      // apply css on it & append it to its parent
      transitionedScrollbar.classList.add('transitioned-scrollbar');
      scrollbar.appendChild(transitionedScrollbar);

      // apply css on it & append it to its parent
      scrollbarContent.classList.add('scrollbar-content');
      scrollbarContent.style.height =
        (<HTMLDivElement>scrollingContent.firstElementChild).offsetHeight +
        'px';
      transitionedScrollbar.appendChild(scrollbarContent);

      // synchronse transitionedScrollbar scrollingContent scrolling
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

      // scrollbar stretcher, stretches scrollbar on mouseover, otherwise the scrollbar
      // area the scrollbar will shrink (transition implemented through css).
      scrollbar.onmouseover = scrollbar.onmouseleave = (ev: MouseEvent) =>
        (transitionedScrollbar.style.marginRight =
          ev.type == 'mouseover' ? '0' : '-12px');
    }
  );
}

module.exports = scrollbar;
