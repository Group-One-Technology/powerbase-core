import { useState } from 'react';
import constate from 'constate';

function useProgressStepModel({ initialStep }) {
  const [step, setStep] = useState(initialStep);

  return {
    step,
    setStep,
  };
}

export const [ProgressStepProvider, useProgressStep] = constate(useProgressStepModel);
