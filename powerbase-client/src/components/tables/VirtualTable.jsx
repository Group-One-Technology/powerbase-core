import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { useViewFields } from '@models/ViewFields';
import { useTableConnections } from '@models/TableConnections';
import { useFieldTypes } from '@models/FieldTypes';
import { useTableRecords } from '@models/TableRecords';
import { FieldPermissionsModalProvider } from '@models/modals/FieldPermissionsModal';
import { useDataListener } from '@lib/hooks/websockets/useDataListener';
import { ITable } from '@lib/propTypes/table';

import { Loader } from '@components/ui/Loader';
import { FieldPermissionsModal } from '@components/permissions/FieldPermissionsModal';
import { TableGrid } from './TableGrid';

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
  const { error: recordsError } = useTableRecords();

  useEffect(() => {
    dataListener(table.id);
  }, [table.id]);

  if (recordsError?.response.data.exception) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height }}>
        <p className="text-sm text-gray-900">
          {recordsError.response.data.exception}
        </p>
      </div>
    );
  }

  if (fields == null || connections == null || fieldTypes == null || records == null) {
    return <Loader style={{ height }} />;
  }

  return (
    <FieldPermissionsModalProvider>
      <TableGrid
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
