import { useRef, useEffect } from 'react';

/**
 * Used to track whether the component has mounted or not, and call a function only when the component is mounted.
 * Mostly used when doing a react setState after an async function.
 * Ex:
 *   await updateUser(...);
 *   mounted(() => setLoading(false)) // This is to ensure that the func will only run when the component is mounted.
 *
 * @returns { isMounted, mounted }
 */
export function useMounted() {
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const mounted = (func) => {
    if (mountedRef.current && typeof func === 'function') func();
  };

  return {
    isMounted: mountedRef.current,
    mounted,
  };
}
