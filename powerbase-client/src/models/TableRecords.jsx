/* eslint-disable */
import constate from "constate";
import useSWR, { useSWRInfinite } from "swr";

import { getTableRecords, getMagicRecords } from "@lib/api/records";
import { useAuthUser } from "./AuthUser";
import { useViewOptions } from "./views/ViewOptions";
import { securedApi } from "@lib/api";

function getKey({ index, tableId, query, sort, filters, pageSize }) {
  const page = index + 1;
  const pageQuery = `page=${page}&limit=${pageSize}`;
  const searchQuery = query?.length ? `&q=${encodeURIComponent(query)}` : "";
  const filterQuery = filters?.id ? `&filterId=${filters.id}` : "";
  const sortQuery = sort?.id ? `&sortId=${sort.id}` : "";

  return `/tables/${tableId}/records?${pageQuery}${searchQuery}${filterQuery}${sortQuery}`;
}

function useTableRecordsModel({ id, pageSize = 40 }) {
  const { authUser } = useAuthUser();
  const { viewId, query, filters, sort } = useViewOptions();

  const response = useSWRInfinite(
    (index) =>
      id && authUser && viewId
        ? getKey({
            index,
            tableId: id,
            query,
            sort,
            filters,
            pageSize,
          })
        : null,
    (url) =>
      id && authUser && viewId
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
        : undefined
  );

  const { data, error, size, setSize } = response;

  const magicRecordsResponse = useSWR(
    `/tables/${id}/magic_records`,
    getMagicRecords
  );

  const { data: magicData, mutate: mutateMagicRecords } = magicRecordsResponse;

  let parsedData = data && data?.reduce((prev, cur) => prev?.concat(cur), []);
  let magicRecords = magicData;

  let mergedData = parsedData;
  parsedData?.forEach((record, idx) =>
    magicRecords?.forEach((magicRecord) => {
      if (magicRecord?.recordId === record?.id) {
        let remoteRecord = record;
        remoteRecord[magicRecord?.fieldName] = magicRecord["textValue"];
        mergedData[idx] = remoteRecord;
      }
    })
  );
  const isLoadingInitialData = !data && !error;
  const isLoading =
    isLoadingInitialData ||
    !!(size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd =
    isEmpty || !!(data && (data[data.length - 1]?.length ?? 0) < pageSize);
  const loadMore = () => setSize((page) => page + 1);

  return {
    ...response,
    data: mergedData,
    isLoading,
    isReachingEnd,
    loadMore,
  };
}

export const [TableRecordsProvider, useTableRecords] =
  constate(useTableRecordsModel);
