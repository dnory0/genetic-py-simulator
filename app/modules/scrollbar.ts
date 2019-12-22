module.exports = function(scrollConts: HTMLCollectionOf<HTMLDivElement>) {
  delete require.cache[require.resolve('./scrollbar')];
  Array.from(scrollConts).forEach((scrollCont: HTMLDivElement) => {
    let fChild = <HTMLDivElement>scrollCont.firstElementChild;
    let nextSib = <HTMLDivElement>scrollCont.nextElementSibling;
    fChild.onscroll = ev => {
      var isNextSib = (<HTMLDivElement>ev.target).classList.contains(
        'scrolling-content'
      );
      (isNextSib ? fChild : nextSib).scrollTo({
        top: isNextSib ? nextSib.scrollTop : fChild.scrollTop
      });
    };

    scrollCont.onmouseover = scrollCont.onmouseleave = (ev: MouseEvent) =>
      (fChild.style.marginRight = ev.type == 'mouseover' ? '0' : '-12px');
  });
};
