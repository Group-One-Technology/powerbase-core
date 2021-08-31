import useSWR from 'swr';
import constate from 'constate';

import { getFieldTypes } from '@lib/api/field-types';
import { useAuthUser } from './AuthUser';

function useFieldTypesModel() {
  const { authUser } = useAuthUser();

  const response = useSWR(
    authUser ? '/field_types' : null,
    () => (authUser ? getFieldTypes() : undefined),
  );

  return {
    ...response,
  };
}

export const [FieldTypesProvider, useFieldTypes] = constate(useFieldTypesModel);
