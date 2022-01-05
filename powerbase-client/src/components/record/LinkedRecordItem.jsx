import React from 'react';
import PropTypes from 'prop-types';

export function LinkedRecordItem({ label, record, openRecord }) {
  return (
    <div role="button" className="p-2 border border-gray-300 rounded-lg" tabIndex={0} onClick={openRecord} onKeyPress={openRecord}>
      <p className="mb-2 text-sm font-medium text-gray-900 truncate">
        {label || `${Object.keys(record)[0].toUpperCase()}: ${record[Object.keys(record)[0]]}`}
      </p>
      <div className="flex items-center gap-2">
        {Object.entries(record)
          .map(([key, value], recordIndex) => (recordIndex !== 0 && recordIndex <= 3) && (
            <div key={key} className="flex-1 overflow-hidden">
              <p className="text-xs text-gray-500 truncate">{key.toUpperCase()}</p>
              <p className="text-xs text-gray-800 truncate h-[24px]">
                {typeof value === 'boolean'
                  ? (
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      checked={value}
                      readOnly
                    />
                  )
                  : value}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}

LinkedRecordItem.propTypes = {
  label: PropTypes.string,
  record: PropTypes.object,
  openRecord: PropTypes.func.isRequired,
};
