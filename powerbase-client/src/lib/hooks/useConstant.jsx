import * as React from "react";

export default function useConstant() {
  const ref = React.useRef();

  if (!ref.current) {
    ref.current = { v: fn() };
  }

  return ref.current.v;
}
