import { useState, useEffect } from 'react';
import constate from 'constate';

import { useViewFields } from '@models/ViewFields';
import { initializeFields } from '@lib/helpers/fields/initializeFields';
import { useTableConnections } from '@models/TableConnections';

function useViewFieldStateModel() {
  const { data: initialFields, mutate: mutateViewFields } = useViewFields();
  const { data: connections } = useTableConnections();
  const [fields, setFields] = useState(
    initializeFields(initialFields, connections),
  );
  const [hasAddedNewField, setHasAddedNewField] = useState(false);

  useEffect(() => {
    setFields(initializeFields(initialFields, connections));
  }, [initialFields, connections]);

  const updateFields = (value) => {
    setFields(initializeFields(value, connections));
  };

  return {
    initialFields,
    fields,
    setFields: updateFields,
    mutateViewFields,
    hasAddedNewField,
    setHasAddedNewField,
  };
}

export const [ViewFieldStateProvider, useViewFieldState] = constate(
  useViewFieldStateModel,
);
