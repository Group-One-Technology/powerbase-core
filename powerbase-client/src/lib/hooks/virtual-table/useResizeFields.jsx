import { useState } from 'react';
import { useViewFields } from '@models/ViewFields';
import { useSaveStatus } from '@models/SaveStatus';
import { useTableView } from '@models/TableView';
import { useBaseUser } from '@models/BaseUser';
import { resizeViewField } from '@lib/api/view-fields';
import { PERMISSIONS } from '@lib/constants/permissions';

/**
 * Handles the resizing of field/column logic.
 * @param {array} fields
 * @param {function} setFields
 * @returns { handleResizeColumn, handleResizeStop }
 */
export function useResizeFields({ fields, setFields }) {
  const { baseUser } = useBaseUser();
  const { saving, saved, catchError } = useSaveStatus();
  const { mutate: mutateViewFields } = useViewFields();
  const { data: view } = useTableView();
  const [resizedColumn, setResizedColumn] = useState();
  const canManageView = baseUser?.can(PERMISSIONS.ManageView, view) && !view.isLocked;

  const handleResizeColumn = (columnIndex, deltaX) => {
    if (canManageView) {
      const updatedColumns = fields.map((field, index) => {
        if (columnIndex === index) {
          setResizedColumn(field);

          return {
            ...field,
            width: Math.max(field.width + deltaX, 10),
            resized: true,
          };
        }

        return field;
      });

      setFields(updatedColumns);
    }
  };

  const handleResizeStop = async () => {
    if (resizedColumn && canManageView) {
      saving();

      try {
        await resizeViewField({
          id: resizedColumn.id,
          width: resizedColumn.width,
        });
        const updatedFields = fields.map((column) => ({
          ...column,
          width: column.id === resizedColumn.id
            ? resizedColumn.width
            : column.width,
        }));

        await mutateViewFields(updatedFields);
        saved();
      } catch (err) {
        catchError(err);
      }
    }
  };

  return {
    handleResizeColumn,
    handleResizeStop,
  };
}
