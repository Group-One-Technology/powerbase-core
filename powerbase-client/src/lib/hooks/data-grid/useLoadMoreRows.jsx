import { useTableRecords } from '@models/TableRecords';
import { useTableRecordsCount } from '@models/TableRecordsCount';

export function useLoadMoreRows({ table, records }) {
  const { loadMore: loadMoreRows, isLoading } = useTableRecords();
  const { data: totalRecords } = useTableRecordsCount();

  const handleLoadMoreRows = (startRowNo, visibleRowCount) => {
    if (isLoading) return;

    const lastVisibleRow = startRowNo + visibleRowCount + table.pageSize;

    if (lastVisibleRow >= records.length && totalRecords > records.length) {
      loadMoreRows();
    }
  };

  return { handleLoadMoreRows };
}
