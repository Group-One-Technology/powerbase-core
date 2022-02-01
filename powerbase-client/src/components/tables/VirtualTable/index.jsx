import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { useViewFields } from '@models/ViewFields';
import { useTableConnections } from '@models/TableConnections';
import { useFieldTypes } from '@models/FieldTypes';
import { FieldPermissionsModalProvider } from '@models/modals/FieldPermissionsModal';
import { useDataListener } from '@lib/hooks/websockets/useDataListener';
import { ITable } from '@lib/propTypes/table';

import { Loader } from '@components/ui/Loader';
import { FieldPermissionsModal } from '@components/permissions/FieldPermissionsModal';
import { TableRenderer } from './TableRenderer';
import 'react-virtualized/styles.css';

export function VirtualTable({
  height,
  table,
  records,
  setRecords,
}) {
  const { data: fields } = useViewFields();
  const { data: connections } = useTableConnections();
  const { data: fieldTypes } = useFieldTypes();
  const { dataListener } = useDataListener();

  useEffect(() => {
    dataListener(table.id);
  }, [table.id]);

  if (fields == null || connections == null || fieldTypes == null || records == null) {
    return <Loader style={{ height }} />;
  }

  return (
    <FieldPermissionsModalProvider>
      <TableRenderer
        height={height}
        table={table}
        records={records}
        setRecords={setRecords}
      />
      <FieldPermissionsModal />
    </FieldPermissionsModalProvider>
  );
}

VirtualTable.propTypes = {
  height: PropTypes.number,
  table: ITable.isRequired,
  records: PropTypes.array,
  setRecords: PropTypes.func.isRequired,
};
