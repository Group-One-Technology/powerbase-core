import { useState, useEffect } from 'react';

/**
 * Handles the state of the field option popover.
 * @param {array} fields
 * @returns { options, setOption }
 */
export function useFieldOptions({ fields }) {
  const [options, setOptions] = useState([]);

  const setOption = (id, value) => {
    setOptions((prevOptions) => prevOptions.map((item) => ({
      ...item,
      open: item.id === id ? value : item.open,
    })));
  };

  useEffect(() => {
    setOptions(fields.map((item) => ({
      id: item.id,
      open: false,
    })));
  }, [fields]);

  return { options, setOption };
}
