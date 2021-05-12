import { useState, useCallback } from 'react';

/**
 * A hook that handles validation.
 *
 * @param {any} initialState The initial/default value of a state.
 * @param {function} validator A function that validates the incoming updated state. It will check if the input is valid before updating the state.
 * @returns [state, dispatch, error]
 */
export function useValidState(initialState, validator) {
  const [state, setState] = useState(initialState);
  const [error, setError] = useState();

  const dispatch = useCallback(((value, validate = true) => {
    setState((current) => {
      const newValue = typeof value === 'function'
        ? value(current)
        : value;

      try {
        validator(newValue);
        setError(undefined);
      } catch (err) {
        if (validate) {
          setError(err);
        }
      }

      return newValue;
    });
  }), []);

  return [state, dispatch, { error, setError }];
}
