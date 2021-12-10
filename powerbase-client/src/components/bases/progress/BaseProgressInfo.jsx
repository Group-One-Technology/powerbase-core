import React from 'react';
import { useProgressStep } from '@models/progress/ProgressStep';

export function BaseProgressInfo() {
  const { step } = useProgressStep();

  return <div>{step}</div>;
}
