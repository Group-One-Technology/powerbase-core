import React from 'react';
import { Icon, SaveStatus, useSaveStatus } from '@models/SaveStatus';

export function SavingIndicator() {
  const { saveStatus: status, error } = useSaveStatus();

  const className = 'h-4 w-4 mr-1';

  let SaveStatusIcon = null;

  if (status === SaveStatus.SAVING) {
    SaveStatusIcon = Icon.Saving;
  } else if (status === SaveStatus.SAVED) {
    SaveStatusIcon = Icon.Saved;
  } else if (status === SaveStatus.ERROR) {
    SaveStatusIcon = Icon.Error;
  }

  if (SaveStatusIcon) {
    return (
      <div className="ml-4 flex text-xs">
        <SaveStatusIcon className={className} aria-hidden="true" />
        <span className="capitalize">
          {status}
          {status === SaveStatus.SAVING && '...'}
        </span>
        {(status === SaveStatus.ERROR && error) && (
          <span>
            : {error.message}
          </span>
        )}
      </div>
    );
  }

  return null;
}
