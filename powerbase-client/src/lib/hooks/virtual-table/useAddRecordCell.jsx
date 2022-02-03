import { useEffect, useState } from 'react';
import { useViewFields } from '@models/ViewFields';

export function useAddRecordCell({ table }) {
  const { data: viewFields } = useViewFields();
  const [isAddRecord, setIsAddRecord] = useState(false);
  const [newRecord, setNewRecord] = useState(viewFields);

  useEffect(() => {
    setNewRecord(viewFields);
  }, [table]);

  const handleValueChange = (fieldId, value) => {
    setNewRecord((curRecord) => curRecord.map((item) => ({
      ...item,
      value: item.fieldId === fieldId
        ? value
        : item.value,
    })));
  };

  const handleAddRecord = () => {
    console.log({ newRecord });
    setIsAddRecord(false);
    setNewRecord(viewFields);
  };

  return {
    isAddRecord,
    setIsAddRecord,
    handleValueChange,
    handleAddRecord,
  };
}
