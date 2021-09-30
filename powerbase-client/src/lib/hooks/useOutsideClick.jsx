import { useEffect, useState } from 'react';

/**
 * A hook that checks if user clicked outside of the passed ref
 * Sets focus as false whenever click is outside.
 */
export function useOutsideClick({ ref, focus: initialFocus }) {
  const [focus, setFocus] = useState(initialFocus || false);

  useEffect(() => {
    const handleClickOutside = (evt) => {
      if (ref.current && !ref.current.contains(evt.target)) {
        setFocus(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref]);

  return [focus, setFocus];
}
