import React, { useEffect } from 'react';

const OutsideCellClick = (props) => {
  let clickCaptured = false;
  let focusCaptured = false;

  const innerClick = () => {
    clickCaptured = true;
  };

  const innerFocus = () => {
    focusCaptured = true;
  };

  const documentClick = (event) => {
    if (!clickCaptured && props.onClickOutside) {
      props.onClickOutside(event);
    }
    clickCaptured = false;
  };

  const documentFocus = (event) => {
    if (!focusCaptured && props.onFocusOutside) {
      props.onFocusOutside(event);
    }
    focusCaptured = false;
  };

  const getProps = () => ({
    className: props.className,
    style: props.style,
    onMouseDown: innerClick,
    onFocus: innerFocus,
    onTouchStart: innerClick,
  });

  const renderComponent = () => React.createElement(
    props.component || 'span',
    getProps(),
    props.children,
  );

  const initialize = () => {
    document.addEventListener('mousedown', documentClick);
    document.addEventListener('focusin', documentFocus);
    document.addEventListener('touchstart', documentClick);
  };

  const clear = () => {
    document.removeEventListener('mousedown', documentClick);
    document.removeEventListener('focusin', documentFocus);
    document.removeEventListener('touchstart', documentClick);
  };

  useEffect(() => {
    initialize();
    return () => clear();
  }, []);

  const render = props.render || props.children;

  if (typeof render === 'function') {
    return render(getProps());
  }

  return renderComponent();
};

export default OutsideCellClick;
