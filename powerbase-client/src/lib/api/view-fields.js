/* eslint-disable  */
import { securedApi } from "./index";

export async function getViewFields({ viewId }) {
  const response = await securedApi.get(`/views/${viewId}/view_fields`);

  if (response.statusText === "OK") {
    return response.data;
  }

  return undefined;
}

export async function hideAllViewFields({ viewId }) {
  const response = await securedApi.put(`/views/${viewId}/view_fields/hide_all`);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function reorderViewFields({ viewId, ...payload }) {
  const response = await securedApi.put(
    `/views/${viewId}/view_fields/order`,
    payload
  );

  if (response.statusText === "OK") {
    return response.data;
  }

  return undefined;
}

export async function hideViewField({ id }) {
  const response = await securedApi.put(`/view_fields/${id}/hide`);

  if (response.statusText === "OK") {
    return response.data;
  }

  return undefined;
}

export async function unhideViewField({ id }) {
  const response = await securedApi.put(`/view_fields/${id}/unhide`);

  if (response.statusText === "OK") {
    return response.data;
  }

  return undefined;
}

export async function resizeViewField({ id, ...payload }) {
  const response = await securedApi.put(`/view_fields/${id}/resize`, payload);

  if (response.statusText === "OK") {
    return response.data;
  }

  return undefined;
}
