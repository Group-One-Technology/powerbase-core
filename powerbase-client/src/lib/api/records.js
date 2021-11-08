/* eslint-disable */
import { func } from "prop-types";
import { securedApi } from "./index";

const determineCellValueKey = (fieldTypeId, precision) => {
  switch (fieldTypeId) {
    case 1:
    case 8:
      return "stringValue";
    case 2:
      return "textValue";
    case 4:
      if (precision) return "decimalValue";
      else return "integerValue";
    default:
      // console.log("Unknown field type");
      return;
  }
};

export async function getTableRecords({ url, ...payload }) {
  let magicData;
  if (payload.isVirtual) return [];
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
          const key = determineCellValueKey(
            magicRecord.fieldTypeId,
            magicRecord.hasPrecision
          );
          if (magicRecord?.recordId === record?.id) {
            let remoteRecord = record;
            remoteRecord[magicRecord?.fieldName] = magicRecord[key];
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
  if (payload.isVirtual) return [];
  const response = await securedApi.post(
    `/tables/${tableId}/records_count`,
    payload
  );

  if (response.statusText === "OK") {
    return response.data;
  }

  return undefined;
}
