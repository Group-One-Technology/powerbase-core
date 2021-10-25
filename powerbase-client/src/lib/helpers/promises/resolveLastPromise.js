/* eslint-disable */
import createImperativePromise from "./imperativePromise";

export default function onlyResolvesLast(asyncFunction) {
  let cancelPrevious = null;
  const wrappedFunction = () => {
    const args = [];
    for (const i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }
    cancelPrevious && cancelPrevious();
    const initialPromise = asyncFunction.apply(void 0, args);
    const imperativePromise = createImperativePromise(initialPromise);
    const { promise, cancel } = imperativePromise;
    cancelPrevious = cancel;
    return promise;
  };
  return wrappedFunction;
}
