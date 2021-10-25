/* eslint-disable */
import React, { useRef, useEffect } from "react";

const OutsideCellClick = (props) => {
  let clickCaptured = false;
  let focusCaptured = false;
  const wrapperRef = useRef();

  innerClick = () => {
    clickCaptured = true;
  };

  innerFocus = () => {
    focusCaptured = true;
  };

  documentClick = (event) => {
    if (!clickCaptured && props.onClickOutside) {
      props.onClickOutside(event);
    }
    clickCaptured = false;
  };

  documentFocus = (event) => {
    if (!focusCaptured && props.onFocusOutside) {
      props.onFocusOutside(event);
    }
    focusCaptured = false;
  };

  const getProps = () => {
    return {
      className: props.className,
      style: props.style,
      onMouseDown: innerClick,
      onFocus: innerFocus,
      onTouchStart: innerClick,
    };
  };

  const renderComponent = () => {
    return React.createElement(
      props.component || "span",
      getProps(),
      props.children
    );
  };

  const init = () => {
    document.addEventListener("mousedown", documentClick);
    document.addEventListener("focusin", documentFocus);
    document.addEventListener("touchstart", documentClick);
  };

  const clear = () => {
    document.removeEventListener("mousedown", documentClick);
    document.removeEventListener("focusin", documentFocus);
    document.removeEventListener("touchstart", documentClick);
  };

  useEffect(() => {
    init();
    return () => clear();
  }, []);

  const render = props.render || props.children;

  if (typeof render === "function") {
    return render(getProps());
  }

  return renderComponent();
};

export default OutsideCellClick;
