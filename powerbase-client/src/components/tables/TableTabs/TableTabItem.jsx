import React from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';

import { useCurrentView } from '@models/views/CurrentTableView';
import { Dot } from '@components/ui/Dot';
import { SortableItem } from '@components/ui/SortableItem';
import { Tooltip } from '@components/ui/Tooltip';

export const TableTabItem = React.forwardRef(({ table, index }, activeTabRef) => {
  const { table: activeTable, handleTableChange } = useCurrentView();

  const isCurrentTable = table.id.toString() === activeTable.id.toString();

  let component = (
    <button
      ref={isCurrentTable ? activeTabRef : undefined}
      className={cn(
        'px-3 py-2 font-medium text-sm rounded-tl-md rounded-tr-md flex items-center whitespace-nowrap',
        isCurrentTable
          ? 'bg-white text-gray-900  '
          : 'bg-gray-900 bg-opacity-20 text-gray-200 hover:bg-gray-900 hover:bg-opacity-25 focus:bg-gray-900 focus:bg-opacity-50 focus:text-white',
      )}
      aria-current={isCurrentTable ? 'page' : undefined}
    >
      {!table.isMigrated && <Dot color="yellow" className="mr-1.5" />}
      {table.alias || table.name}
    </button>
  );

  if (!table.isMigrated) {
    component = (
      <Tooltip
        text="Migrating"
        position={index > 1 ? 'left' : 'right'}
        className={index > 1 ? '-left-16 top-2 z-10' : '-right-4 top-2 z-10'}
      >
        {component}
      </Tooltip>
    );
  }

  return (
    <SortableItem
      id={table.id}
      role={undefined}
      tabIndex={undefined}
      onClick={() => handleTableChange({ table })}
    >
      {component}
    </SortableItem>
  );
});

TableTabItem.propTypes = {
  table: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
};
