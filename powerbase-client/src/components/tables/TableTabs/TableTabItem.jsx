import React from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import * as Tooltip from '@radix-ui/react-tooltip';

import { useCurrentView } from '@models/views/CurrentTableView';
import { Dot } from '@components/ui/Dot';
import { SortableItem } from '@components/ui/SortableItem';

export const TableTabItem = React.forwardRef(({ table }, activeTabRef) => {
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
      <Tooltip.Root delayDuration={0}>
        <Tooltip.Trigger>
          {component}
        </Tooltip.Trigger>
        <Tooltip.Content className="bg-gray-900 text-white text-xs py-1 px-2 rounded">
          <Tooltip.Arrow className="gray-900" />
          Migrating
        </Tooltip.Content>
      </Tooltip.Root>
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
};
