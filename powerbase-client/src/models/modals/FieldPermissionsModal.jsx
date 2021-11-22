import constate from 'constate';
import { useState, useEffect } from 'react';
import { useViewFields } from '@models/ViewFields';

function useFieldPermissionsModalModel() {
  const { data: fields } = useViewFields();
  const [open, setOpen] = useState(false);
  const [field, setField] = useState();

  useEffect(() => {
    if (field && fields?.length) {
      const updatedField = fields.find((item) => item.id === field.id);
      setField(updatedField);
    }
  }, [fields]);

  const openModal = (value) => {
    const isViewField = value.fieldId != null;
    const curField = isViewField
      ? {
        ...value,
        id: value.fieldId,
      } : value;
    delete curField.fieldId;
    setField(curField);
    setOpen(true);
  };

  return {
    modal: {
      state: open,
      setState: setOpen,
      open: openModal,
    },
    field,
    setField,
  };
}

export const [FieldPermissionsModalProvider, useFieldPermissionsModal] = constate(useFieldPermissionsModalModel);
