import { useState } from 'react';
import { useViewFields } from '@models/ViewFields';
import { resizeViewField } from '@lib/api/view-fields';

/**
 * Handles the resizing of field/column logic.
 * @param {array} fields
 * @param {function} setFields
 * @returns { handleResizeColumn, handleResizeStop }
 */
export function useResizeFields({ fields, setFields }) {
  const { mutate: mutateViewFields } = useViewFields();
  const [resizedColumn, setResizedColumn] = useState();

  const handleResizeColumn = (columnIndex, deltaX) => {
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
  };

  const handleResizeStop = async () => {
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

      mutateViewFields(updatedFields);
    } catch (err) {
      console.log(err);
    }
  };

  return {
    handleResizeColumn,
    handleResizeStop,
  };
}
