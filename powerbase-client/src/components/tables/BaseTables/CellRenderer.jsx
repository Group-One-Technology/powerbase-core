import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { FieldTypeIcon } from '@components/ui/FieldTypeIcon';

export function CellRenderer({
  columnIndex,
  key,
  rowIndex,
  style,
  value,
}) {
  const isHeader = rowIndex === 0;
  const isRowNo = columnIndex === 0;

  return (
    <div
      role="button"
      id={`row-${rowIndex}_col-${columnIndex}`}
      key={key}
      className={cn(
        'single-line text-sm truncate focus:bg-gray-100 border-b border-r border-gray-200 flex items-center py-1 px-2',
        isHeader && 'bg-gray-100',
        isRowNo && 'flex justify-center text-xs text-gray-500',
      )}
      style={style}
      tabIndex={0}
      onKeyDown={(evt) => {
        const el = evt.target;

        if (evt.code === 'Enter' && !isRowNo) {
          el.contentEditable = el.contentEditable !== 'true';
        }
      }}
      onDoubleClick={(evt) => {
        if (!isRowNo) evt.target.contentEditable = true;
      }}
      onBlur={(evt) => {
        if (!isRowNo) evt.target.contentEditable = false;
      }}
      suppressContentEditableWarning
    >
      {(isHeader && columnIndex !== 0) && <FieldTypeIcon className="mr-1" />}
      {value?.toString()}
    </div>
  );
}

CellRenderer.propTypes = {
  key: PropTypes.number.isRequired,
  rowIndex: PropTypes.number.isRequired,
  columnIndex: PropTypes.number.isRequired,
  style: PropTypes.string.isRequired,
  value: PropTypes.any.isRequired,
};
