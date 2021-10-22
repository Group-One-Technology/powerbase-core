import React from 'react';

import { useBase } from '@models/Base';
import { useCurrentView } from '@models/views/CurrentTableView';
import { TableTabs } from '@components/tables/TableTabs';
import { TableContent } from '@components/tables/TableContent';
import { Loader } from '@components/ui/Loader';
import { CustomModal } from '@components/ui/CustomModal';

export function Table() {
  const { data: base } = useBase();
  const {
    table,
    tables,
    views,
    view,
  } = useCurrentView();

  if (base == null || table == null || tables == null) {
    return <Loader className="h-screen" />;
  }

  return (
    <>
      {
        // TODO: TBC - JEN
        !table.hasPrimaryKey && false
        && <CustomModal>
            "This table doesn't have a primary key, would like us to add one?"
        </CustomModal>
      }
      <TableTabs />
      <TableContent
        table={table}
        tables={tables}
        views={views}
        currentView={view}
      />
    </>
  );
}
