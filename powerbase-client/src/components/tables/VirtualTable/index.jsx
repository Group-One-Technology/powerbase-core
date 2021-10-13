/* eslint-disable*/
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Pusher from 'pusher-js';
import { useViewFields } from '@models/ViewFields';
import { useTableConnections } from '@models/TableConnections';
import { useTableRecords } from '@models/TableRecords';
import { useTableRecordsCount } from '@models/TableRecordsCount';
import { useTableReferencedConnections } from '@models/TableReferencedConnections';
import { useFieldTypes } from '@models/FieldTypes';
import { ITable } from '@lib/propTypes/table';

import { Loader } from '@components/ui/Loader';
import { TableRenderer } from './TableRenderer';

import 'react-virtualized/styles.css';

export function VirtualTable({ height, tables, table }) {
  const { data: fields, mutate: mutateViewFields } = useViewFields();
  const { data: connections } = useTableConnections();
  const { data: referencedConnections } = useTableReferencedConnections();
  const { data: totalRecords } = useTableRecordsCount();
  const { data: records, loadMore, isLoading, mutate: mutateTableRecords, isUpdating, setIsUpdating } = useTableRecords();
  const { data: fieldTypes } = useFieldTypes();

  if (fields == null || connections == null || records == null || fieldTypes == null) {
    return <Loader style={{ height }} />;
  }

  async function mutateCallback() {
    const mutated = await mutateTableRecords();
    setIsUpdating(false)
  }

  const attachWebsocket = function () {
    Pusher.logToConsole = true;
    const pusher = new Pusher('1fa8e84feca07575f40d', {
      cluster: 'ap1',
    });
    const channel = pusher.subscribe(`table.${table.id}`);
    channel.bind('powerbase-data-listener', () => {
      setIsUpdating(true)
      mutateCallback()
    });
  };

  useEffect(() => {
    attachWebsocket();
  }, [])

  return (
    <>
      <TableRenderer
        fields={fields}
        records={[
          ...records.map((record, index) => [
            index + 1,
            ...Object.values(record),
          ]),
          [records.length + 1, ...new Array(fields.length).fill('')],
        ]}
        totalRecords={totalRecords}
        loadMoreRows={loadMore}
        isLoading={isLoading}
        height={height}
        tables={tables}
        connections={connections}
        referencedConnections={referencedConnections}
        fieldTypes={fieldTypes}
        mutateViewFields={mutateViewFields}
        isUpdating={isUpdating}
      />
    </>
  );
}

VirtualTable.propTypes = {
  height: PropTypes.number,
  tables: PropTypes.arrayOf(ITable),
  table: PropTypes.object,
};
