import constate from 'constate';
import useSWR, { useSWRInfinite } from 'swr';
import { useState } from 'react';
import { getTableRecords, getMagicValues } from '@lib/api/records';
import { getParameterCaseInsensitive } from '@lib/helpers/getParameterCaseInsensitive';
import { useAuthUser } from './AuthUser';
import { useViewOptions } from './views/ViewOptions';

function getKey({
  index, tableId, query, sort, filters, pageSize,
}) {
  const page = index + 1;
  const pageQuery = `page=${page}&limit=${pageSize}`;
  const searchQuery = query?.length ? `&q=${encodeURIComponent(query)}` : '';
  const filterQuery = filters?.id ? `&filterId=${filters.id}` : '';
  const sortQuery = sort?.id ? `&sortId=${sort.id}` : '';

  return `/tables/${tableId}/records?${pageQuery}${searchQuery}${filterQuery}${sortQuery}`;
}

function useTableRecordsModel({ id, pageSize = 40, isTurbo }) {
  const { authUser } = useAuthUser();
  const {
    viewId, query, filters, sort,
  } = useViewOptions();

  const response = useSWRInfinite(
    (index) => (id && authUser && viewId
      ? getKey({
        index,
        tableId: id,
        query,
        sort,
        filters,
        pageSize,
      })
      : null),
    (url) => (id && authUser && viewId
      ? getTableRecords({
        url,
        viewId,
        tableId: id,
        query,
        filters:
              filters && filters.id && filters.value
                ? filters.value
                : undefined,
        sort: sort && sort.id && sort.value ? sort.value : undefined,
      })
      : undefined),
  );

  const {
    data, error, size, setSize,
  } = response;

  const parsedData = data && data?.reduce((prev, cur) => prev?.concat(cur), []);
  const mergedData = parsedData;

  // ! TODO - Refactor to handle date aggregation on the backend
  if (!isTurbo) {
    const magicValuesResponse = useSWR(
      `/tables/${id}/magic_values`,
      getMagicValues,
    );
    const { data: magicData } = magicValuesResponse;
    parsedData?.forEach((record, idx) => magicData?.forEach((magicValue) => {
      const matches = [];
      const primaryKeys = magicValue.docId.split('---');
      primaryKeys.forEach((key, pkIdx) => {
        const sanitized = key.split('___');
        const pkName = sanitized[0];
        const pkValue = sanitized[1];
        matches.push(
          `${getParameterCaseInsensitive(record, pkName)}` === `${pkValue}`,
        );
        if (pkIdx === primaryKeys.length - 1 && !matches.includes(false)) {
          const { docId, ...associatedValue } = magicValue;
          const combined = { ...record, ...associatedValue };
          mergedData[idx] = combined;
        }
      });
    }));
  }

  console.log(parsedData);

  const isLoadingInitialData = !data && !error;
  const isLoading = isLoadingInitialData
    || !!(size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd = isEmpty || !!(data && (data[data.length - 1]?.length ?? 0) < pageSize);
  const loadMore = () => setSize((page) => page + 1);
  const [highlightedCell, setHighLightedCell] = useState(null);

  return {
    ...response,
    data: mergedData,
    isLoading,
    isReachingEnd,
    loadMore,
    highlightedCell,
    setHighLightedCell,
  };
}

export const [TableRecordsProvider, useTableRecords] = constate(useTableRecordsModel);
