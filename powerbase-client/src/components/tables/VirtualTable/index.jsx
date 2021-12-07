import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { useViewFields } from '@models/ViewFields';
import { useTableConnections } from '@models/TableConnections';
import { useTableRecords } from '@models/TableRecords';
import { useFieldTypes } from '@models/FieldTypes';
import { FieldPermissionsModalProvider } from '@models/modals/FieldPermissionsModal';
import { useDataListener } from '@lib/hooks/websockets/useDataListener';
import { ITable } from '@lib/propTypes/table';

import { Loader } from '@components/ui/Loader';
import { FieldPermissionsModal } from '@components/permissions/FieldPermissionsModal';
import { TableRenderer } from './TableRenderer';
import 'react-virtualized/styles.css';

export function VirtualTable({ height, table }) {
  const { data: fields } = useViewFields();
  const { data: connections } = useTableConnections();
  const { data: records, highlightedCell } = useTableRecords();
  const { data: fieldTypes } = useFieldTypes();
  const { dataListener } = useDataListener();

  useEffect(() => {
    dataListener(table.id);
  }, [table.id]);

  if (
    fields == null
    || connections == null
    || records == null
    || fieldTypes == null
  ) {
    return <Loader style={{ height }} />;
  }

  return (
    <FieldPermissionsModalProvider>
      <TableRenderer height={height} table={table} highlightedCell={highlightedCell} />
      <FieldPermissionsModal />
    </FieldPermissionsModalProvider>
  );
}

VirtualTable.propTypes = {
  height: PropTypes.number,
  table: ITable.isRequired,
};
