import React from 'react';

import { useCurrentView } from '@models/views/CurrentTableView';
import { IBase } from '@lib/propTypes/base';
import { TableTabs } from '@components/tables/TableTabs';
import { TableContent } from '@components/tables/TableContent';
import { Loader } from '@components/ui/Loader';
import { CustomModal } from '@components/ui/CustomModal';

export function Table({ base }) {
  const {
    table,
    tables,
    views,
    view,
    handleTableChange,
  } = useCurrentView();

  if (base == null || table == null || tables == null) {
    return <Loader className="h-screen" />;
  }

  return (
    <>
      {
        !table.hasPrimaryKey && false
        && <CustomModal>
            "This table doesn't have a primary key, would like us to add one?"
        </CustomModal>
      }
      <TableTabs
        color={base.color}
        tables={tables}
        tableId={table.id}
        handleTableChange={handleTableChange}
      />
      <TableContent
        table={table}
        tables={tables}
        views={views}
        currentView={view}
      />
    </>
  );
}

Table.propTypes = {
  base: IBase.isRequired,
};
