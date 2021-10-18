/* eslint-disable*/
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Pusher from 'pusher-js';
import { useViewFields } from '@models/ViewFields';
import { useTableConnections } from '@models/TableConnections';
import { useTableRecords } from '@models/TableRecords';
import { useFieldTypes } from '@models/FieldTypes';
import { ITable } from '@lib/propTypes/table';

import { Loader } from '@components/ui/Loader';
import { TableRenderer } from './TableRenderer';

import 'react-virtualized/styles.css';

export function VirtualTable({ height, table, tables }) {
  const { data: fields } = useViewFields();
  const { data: connections } = useTableConnections();
  const { data: records, highlightedCell, setHighLightedCell, mutate: mutateTableRecords } = useTableRecords();
  const { data: fieldTypes } = useFieldTypes();

  if (fields == null || connections == null || records == null || fieldTypes == null) {
    return <Loader style={{ height }} />;
  }
  
  const attachWebsocket = function () {
    Pusher.logToConsole = true;
    const pusher = new Pusher('1fa8e84feca07575f40d', {
      cluster: 'ap1',
    });
    const channel = pusher.subscribe(`table.${table.id}`);
    channel.bind('powerbase-data-listener', async (data) => {
      const mutated = await mutateTableRecords();
      setHighLightedCell(data.doc_id)
      setTimeout(() => {
        setHighLightedCell(null)
      }, 3000);
    });
  };

  useEffect(() => {
    attachWebsocket();
  }, [])
  return <TableRenderer height={height} table={table} tables={tables} highlightedCell={highlightedCell}/>;
}

VirtualTable.propTypes = {
  height: PropTypes.number,
  table: ITable.isRequired,
  tables: PropTypes.arrayOf(ITable),
  table: PropTypes.object,
};
