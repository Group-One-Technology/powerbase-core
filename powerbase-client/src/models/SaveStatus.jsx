import { useRef, useState } from 'react';
import constate from 'constate';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/outline';
import { useMounted } from '@lib/hooks/useMounted';
import { Spinner } from '@components/ui/Spinner';

const IDLE_TIME = 600000; // milliseconds = 10 minutes

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
    if (value === SaveStatus.SAVED) {
      setTimeout(() => {
        const currentState = saveStatusRef.current;

        if (currentState === SaveStatus.SAVED) {
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
      setError(err);
      setSaveStatus(SaveStatus.ERROR);
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
