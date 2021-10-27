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
      setSaveStatus(SaveStatus.IDLE);
    });
  };

  const saving = () => {
    mounted(() => {
      setError(undefined);
      setSaveStatus(SaveStatus.SAVING);
    });
  };

  const saved = () => mounted(() => setSaveStatus(SaveStatus.SAVED));

  const catchError = (err) => {
    mounted(() => {
      setError(new Error('Something went wrong.'));
      setSaveStatus(SaveStatus.ERROR);
      toast(Array.isArray(err) ? err.join('. ') : err, {
        icon: '⚠️',
        className: 'bg-gray-800 text-sm text-white rounded-md',
      });
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
  };
}

export const [SaveStatusProvider, useSaveStatus] = constate(useSaveStateModel);
