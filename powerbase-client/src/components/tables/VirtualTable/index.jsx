/* eslint-disable*/
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useViewFields } from '@models/ViewFields';
import { useTableConnections } from '@models/TableConnections';
import { useTableRecords } from '@models/TableRecords';
import { useFieldTypes } from '@models/FieldTypes';
import { useMounted } from '@lib/hooks/useMounted';
import { useWebsocket } from '@lib/hooks/useWebsocket';
import { ITable } from '@lib/propTypes/table';

import { Loader } from '@components/ui/Loader';
import { TableRenderer } from './TableRenderer';

import 'react-virtualized/styles.css';

export function VirtualTable({ height, table }) {
  const { data: fields } = useViewFields();
  const { data: connections } = useTableConnections();
  const { data: records, highlightedCell } = useTableRecords();
  const { data: fieldTypes } = useFieldTypes();
  const { mounted } = useMounted();
  const { dataListener } = useWebsocket();

  if (fields == null || connections == null || records == null || fieldTypes == null) {
    return <Loader style={{ height }} />;
  }
  
  mounted(() => dataListener(table.id));
  return <TableRenderer height={height} table={table} highlightedCell={highlightedCell}/>;
}

VirtualTable.propTypes = {
  height: PropTypes.number,
  table: ITable.isRequired,
};
