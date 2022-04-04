import { useReducer } from 'react';
import { captureError } from '@lib/helpers/captureError';

function dataReducer(state, action) {
  switch (action.type) {
    case 'pending': {
      return { status: 'pending', data: null, error: null };
    }
    case 'resolved': {
      return { status: 'resolved', data: action.data, error: null };
    }
    case 'rejected': {
      return { status: 'rejected', data: null, error: action.error };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

const DEFAULT_PARAMS = {
  catchError: true,
};

export function useData({ catchError = true } = DEFAULT_PARAMS) {
  const [state, dispatch] = useReducer(dataReducer);

  const pending = () => dispatch({ type: 'pending' });
  const resolved = (data) => dispatch({ type: 'resolved', data });
  const rejected = (error) => {
    dispatch({ type: 'rejected', error });
    if (catchError) captureError(error);
  };

  return {
    ...state,
    dispatch: {
      pending,
      resolved,
      rejected,
    },
  };
}
