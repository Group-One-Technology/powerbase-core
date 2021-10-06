import { useEffect, useRef } from 'react';

const SCROLL_OFFSET = 100;

export function useTableTabsScroll() {
  const tabsContainerEl = useRef();
  const activeTabEl = useRef();

  useEffect(() => {
    activeTabEl.current?.scrollIntoView({ behavior: 'smooth' });

    if (tabsContainerEl.current) {
      const leftArrowEl = document.getElementById('tableTabsLeftArrow');
      const rightArrowEl = document.getElementById('tableTabsRightArrow');
      const scrollPosition = tabsContainerEl.current.scrollLeft;

      if (scrollPosition <= 0) {
        leftArrowEl.classList.add('invisible');
      } else if (scrollPosition >= tabsContainerEl.current.scrollWidth - SCROLL_OFFSET) {
        rightArrowEl.classList.add('invisible');
      }
    }
  }, []);

  const handleScroll = (position) => {
    if (tabsContainerEl.current) {
      const { scrollWidth } = tabsContainerEl.current;
      const scrollOffsetWidth = tabsContainerEl.current.offsetWidth - SCROLL_OFFSET;
      const scrollPosition = tabsContainerEl.current.scrollLeft;

      let scrollTo = position === 'right'
        ? scrollPosition + scrollOffsetWidth
        : scrollPosition - scrollOffsetWidth;

      if (scrollTo <= 0) {
        scrollTo = 0;
      } else if (scrollTo >= scrollWidth - scrollOffsetWidth) {
        scrollTo = scrollWidth;
      }

      tabsContainerEl.current.scroll({ left: scrollTo, behavior: 'smooth' });

      const leftArrowEl = document.getElementById('tableTabsLeftArrow');
      const rightArrowEl = document.getElementById('tableTabsRightArrow');

      if (position === 'left' && scrollTo <= 0) {
        leftArrowEl.classList.add('invisible');
      } else {
        leftArrowEl.classList.remove('invisible');
      }

      if (position === 'right' && scrollTo >= scrollWidth) {
        rightArrowEl.classList.add('invisible');
      } else {
        rightArrowEl.classList.remove('invisible');
      }
    }
  };

  return { tabsContainerEl, activeTabEl, handleScroll };
}
