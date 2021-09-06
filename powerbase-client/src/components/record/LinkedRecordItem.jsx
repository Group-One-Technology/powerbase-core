import React from 'react';
import PropTypes from 'prop-types';

export function LinkedRecordItem({ record }) {
  return (
    <div className="p-2 border border-gray-300 rounded-lg">
      <p className="mb-2 text-sm font-medium text-gray-900 truncate">
        {record[Object.keys(record)[0]]}
      </p>
      <div className="flex items-center gap-2">
        {Object.entries(record)
          .map(([key, value], recordIndex) => (recordIndex !== 0 && recordIndex <= 3) && (
            <div key={key} className="flex-1 overflow-hidden">
              <p className="text-xs text-gray-500 truncate">{key.toUpperCase()}</p>
              <p className="text-xs text-gray-800 truncate">{value == null ? <>&nbsp;</> : value}</p>
            </div>
          ))}
      </div>
    </div>
  );
}

LinkedRecordItem.propTypes = {
  record: PropTypes.object.isRequired,
};
