import { useRef, useState } from 'react';
import constate from 'constate';
import toast from 'react-hot-toast';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/outline';

import { useMounted } from '@lib/hooks/useMounted';
import { Spinner } from '@components/ui/Spinner';

const IDLE_TIME = 30000; // milliseconds = 30 seconds

export const Icon = {
  Saving: Spinner,
  Saved: CheckCircleIcon,
  Error: ExclamationCircleIcon,
};

export const SaveStatus = {
  IDLE: 'Idle',
  SAVING: 'Saving',
  SAVED: 'Saved',
  ERROR: 'Error',
};

function useSaveStateModel() {
  const [saveStatus, setSaveStatus] = useState(SaveStatus.IDLE);
  const [error, setError] = useState();
  const [loading, setLoading] = useState();
  const { mounted } = useMounted();

  const saveStatusRef = useRef(saveStatus);
  saveStatusRef.current = saveStatus;

  const updateState = (value) => {
    if (value === SaveStatus.SAVED || value === SaveStatus.ERROR) {
      setTimeout(() => {
        const currentState = saveStatusRef.current;

        if (currentState === SaveStatus.SAVED || currentState === SaveStatus.ERROR) {
          setSaveStatus(SaveStatus.IDLE);
        }
      }, IDLE_TIME);
    }

    setSaveStatus(value);
  };

  const resetSaveStatus = () => {
    mounted(() => {
      setError(undefined);
      updateState(SaveStatus.IDLE);
    });
  };

  const saving = () => {
    mounted(() => {
      setLoading(true);
      setError(undefined);
      updateState(SaveStatus.SAVING);
    });
  };

  const saved = (message) => {
    mounted(() => {
      updateState(SaveStatus.SAVED);
      setLoading(false);

      if (message?.length) {
        toast(message, {
          icon: '✅',
          className: 'bg-gray-800 text-sm text-white rounded-md',
        });
      }
    });
  };

  const catchError = (err, { silent } = { silent: false }) => {
    const errorMessage = err.response?.data
      ? err.response.data.exception || err.response.data.error
      : err;

    mounted(() => {
      setLoading(false);
      updateState(SaveStatus.IDLE);

      if (!silent) {
        setError(new Error('Something went wrong.'));
        updateState(SaveStatus.ERROR);
        toast(Array.isArray(errorMessage) ? err.join('. ') : errorMessage, {
          icon: '⚠️',
          className: 'bg-gray-800 text-sm text-white rounded-md',
        });
      }
    });
  };

  return {
    saveStatus,
    setSaveStatus: updateState,
    saved,
    saving,
    catchError,
    resetSaveStatus,
    error,
    setError,
    loading,
    setLoading,
  };
}

export const [SaveStatusProvider, useSaveStatus] = constate(useSaveStateModel);
