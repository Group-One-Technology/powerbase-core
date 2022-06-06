import React from 'react';
import PropTypes from 'prop-types';
import { DataEditor } from '@glideapps/glide-data-grid';
import { useDataGrid } from '@lib/hooks/data-grid/useDataGrid';
import { useResizeField } from '@lib/hooks/fields/useResizeField';
import { useViewFieldState } from '@models/view/ViewFieldState';

export function TableGrid({ height, table, records }) {
  const { fields, setFields } = useViewFieldState();
  const { columns, getContent, getHeaderIcons } = useDataGrid({ table, fields, records });
  const { handleResizeField } = useResizeField({ fields, setFields });

  return (
    <DataEditor
      height={height}
      width="100%"
      rows={records?.length}
      columns={columns}
      getCellContent={getContent}
      headerIcons={getHeaderIcons}
      rowMarkers="number"
      onColumnResize={(column, newSize) => handleResizeField(column.id, newSize)}
    />
  );
}

TableGrid.propTypes = {
  height: PropTypes.number.isRequired,
  table: PropTypes.object.isRequired,
  records: PropTypes.array,
  // setRecords: PropTypes.func.isRequired,
};
