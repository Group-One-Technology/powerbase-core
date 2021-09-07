/* eslint-disable function-paren-newline */
/* eslint-disable comma-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
/* eslint-disable implicit-arrow-linebreak */
import constate from "constate";
import useSWR from "swr";
import { getViewFields } from "@lib/api/view-fields";
import { useAuthUser } from "./AuthUser";

function useViewFieldsModel({ id }) {
  const { authUser } = useAuthUser();

  const response = useSWR(id && authUser ? `/views/${id}/fields` : null, () =>
    getViewFields({ viewId: id })
  );

  console.log(response.data);

  return {
    ...response,
  };
}

export const [ViewFieldsProvider, useViewFields] = constate(useViewFieldsModel);
