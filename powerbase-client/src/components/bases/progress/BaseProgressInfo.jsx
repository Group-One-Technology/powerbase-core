import React from 'react';
import { useProgressStep } from '@models/progress/ProgressStep';
import { ProgressMigratingMetadata } from './ProgressMigratingMetadata';

export function BaseProgressInfo() {
  const { step } = useProgressStep();

  switch (step) {
    case 1: return <ProgressMigratingMetadata />;
    default: return <div>{step}</div>;
  }
}
