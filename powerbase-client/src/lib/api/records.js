/* eslint-disable */
import { securedApi } from "./index";

export async function getTableRecords({ url, ...payload }) {
  let magicData;
  const tableId = payload?.tableId;
  const magicResponse = await securedApi.get(
    `/tables/${tableId}/magic_records`
  );
  if (magicResponse.statusText === "OK" && magicResponse.data?.length) {
    magicData = magicResponse.data;
  }
  const response = await securedApi.post(url, payload);

  if (response.statusText === "OK") {
    const data = response.data;
    let parsedData = data && data?.reduce((prev, cur) => prev?.concat(cur), []);
    if (magicData) {
      let mergedData = parsedData;
      parsedData?.forEach((record, idx) =>
        magicData?.forEach((magicRecord) => {
          if (magicRecord?.recordId === record?.id) {
            let remoteRecord = record;
            remoteRecord[magicRecord?.fieldName] = magicRecord["textValue"];
            mergedData[idx] = remoteRecord;
          }
        })
      );
      return mergedData;
    } else return data;
  }

  return undefined;
}

export async function getMagicRecords(url) {
  const response = await securedApi.get(url);
  if (response.statusText === "OK") {
    return response.data;
  }
  return undefined;
}

export async function getTableRecord({ tableId, recordId, ...payload }) {
  const response = await securedApi.post(
    `/tables/${tableId}/records/${recordId}`,
    payload
  );

  if (response.statusText === "OK") {
    return response.data;
  }

  return undefined;
}

// const magicRecordsResponse = useSWR(
//   `/tables/${id}/magic_records`,
//   getMagicRecords
// );

// const { data: magicData, mutate: mutateMagicRecords } = magicRecordsResponse;

// let parsedData = data && data?.reduce((prev, cur) => prev?.concat(cur), []);
// let magicRecords = magicData;

// let mergedData = parsedData;
// parsedData?.forEach((record, idx) =>
//   magicRecords?.forEach((magicRecord) => {
//     if (magicRecord?.recordId === record?.id) {
//       let remoteRecord = record;
//       remoteRecord[magicRecord?.fieldName] = magicRecord["textValue"];
//       mergedData[idx] = remoteRecord;
//     }
//   })
// );

export async function getTableRecordsCount({ tableId, ...payload }) {
  const response = await securedApi.post(
    `/tables/${tableId}/records_count`,
    payload
  );

  if (response.statusText === "OK") {
    return response.data;
  }

  return undefined;
}
