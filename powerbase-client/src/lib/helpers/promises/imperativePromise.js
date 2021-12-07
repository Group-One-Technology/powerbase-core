

export default function createImperativePromise(promiseArg) {
  let resolve = null;
  let reject = null;
  const wrappedPromise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  promiseArg &&
    promiseArg.then(
      (val) => {
        resolve && resolve(val);
      },
      (error) => {
        reject && reject(error);
      }
    );
  return {
    promise: wrappedPromise,
    resolve(value) {
      resolve && resolve(value);
    },
    reject(reason) {
      reject && reject(reason);
    },
    cancel() {
      resolve = null;
      reject = null;
    },
  };
}
