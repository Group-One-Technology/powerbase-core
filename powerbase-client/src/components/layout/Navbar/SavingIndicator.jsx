import React from 'react';
import PropTypes from 'prop-types';
import { Icon, SaveStatus } from '@models/SaveStatus';

export function SavingIndicator({ status, error }) {
  const className = 'h-4 w-4';

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
      <div className="ml-4 flex gap-x-1 text-xs">
        <SaveStatusIcon className={className} aria-hidden="true" />
        <span className="capitalize">
          {status}
          {status === SaveStatus.SAVING && '...'}
          {(status === SaveStatus.ERROR && error) && `: ${error.message}`}
        </span>
      </div>
    );
  }

  return null;
}

SavingIndicator.propTypes = {
  status: PropTypes.string,
  error: PropTypes.object,
};
