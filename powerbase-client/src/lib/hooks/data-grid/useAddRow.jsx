import React from 'react';

import { useBaseUser } from '@models/BaseUser';
import { useViewFieldState } from '@models/view/ViewFieldState';
import { useViewOptions } from '@models/views/ViewOptions';
import { useViewFields } from '@models/ViewFields';
import { useSaveStatus } from '@models/SaveStatus';
import { useTableRecords } from '@models/TableRecords';
import { useAddRecordModal } from '@models/modals/AddRecordModal';
import { useTableRecordsCount } from '@models/TableRecordsCount';
import { PERMISSIONS } from '@lib/constants/permissions';
import { addRecord } from '@lib/api/records';
import { useMounted } from '../useMounted';

export function useAddRow({ table, records, setRecords }) {
  const { mounted } = useMounted();
  const { baseUser } = useBaseUser();
  const { initialFields } = useViewFieldState();
  const { saved, saving, catchError } = useSaveStatus();
  const { filters: { value: initialFilters } } = useViewOptions();
  const { data: viewFields } = useViewFields();
  const { mutate: mutateTableRecords } = useTableRecords();
  const { mutate: mutateTableRecordsCount } = useTableRecordsCount();
  const { setOpen: setNewRecordModalOpen } = useAddRecordModal();

  const canAddRecord = baseUser?.can(PERMISSIONS.AddRecords, table);

  const trailingRowOptions = React.useMemo(() => (canAddRecord
    ? ({
      sticky: true,
      tint: true,
      hint: 'New row...',
    }) : null), [canAddRecord]);

  const saveNewRecord = React.useCallback(async () => {
    saving();

    const newRecord = viewFields.reduce((values, item) => ({
      ...values,
      [item.name]: item.defaultValue?.length > 0 || item.isAutoIncrement
        ? 'SQL::DEFAULT'
        : undefined,
    }), {});

    let updatedRecords = [...records, newRecord];

    try {
      const addedRecord = await addRecord({
        tableId: table.id,
        primaryKeys: {},
        data: newRecord,
      });
      updatedRecords = [...records, { ...newRecord, ...addedRecord }];
      mounted(() => setRecords(updatedRecords));
      mutateTableRecordsCount();
      await mutateTableRecords(updatedRecords, false);
      saved();
    } catch (err) {
      mounted(() => setRecords(records));
      catchError(err);
    }
  }, [table, records]);

  const onRowAppended = () => {
    const hasNonNullableFields = initialFields.some((item) => !item.isNullable && !item.isAutoIncrement);

    if (hasNonNullableFields || initialFilters?.filters?.length) {
      setNewRecordModalOpen(true);
    } else {
      saveNewRecord();
    }
  };

  return {
    trailingRowOptions,
    onRowAppended,
  };
}
