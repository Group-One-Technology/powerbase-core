import React from 'react';
import PropTypes from 'prop-types';
import { DataEditor } from '@glideapps/glide-data-grid';
import { useDataGrid } from '@lib/hooks/data-grid/useDataGrid';

export function TableGrid({ height, table, records }) {
  const { columns, getContent, getHeaderIcons } = useDataGrid({ table, records });

  return (
    <DataEditor
      height={height}
      width="100%"
      rows={records?.length}
      columns={columns}
      getCellContent={getContent}
      headerIcons={getHeaderIcons}
      rowMarkers="number"
      onColumnResize={(value) => {
        console.log(value);
      }}
    />
  );
}

TableGrid.propTypes = {
  height: PropTypes.number.isRequired,
  table: PropTypes.object.isRequired,
  records: PropTypes.array,
  // setRecords: PropTypes.func.isRequired,
};
