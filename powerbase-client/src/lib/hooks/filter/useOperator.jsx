import { useState } from 'react';
import { useFieldTypes } from '@models/FieldTypes';
import { OPERATOR } from '@lib/constants/filter';

/**
 * Sets the list of operators and the selected operator based on the field's type.
 *
 * @returns [operator, setOperator, operators, updateOperator, fieldType]
 */
export function useOperator({ filter, field }) {
  const { data: fieldTypes } = useFieldTypes();
  const fieldType = fieldTypes.find((item) => item.id.toString() === field.fieldTypeId.toString());

  const [operators, setOperators] = useState(fieldType?.name
    ? OPERATOR[fieldType.name]
    : OPERATOR.TEXT);
  const [operator, setOperator] = useState(filter?.filter?.operator || (fieldType?.name
    ? OPERATOR[fieldType.name][0]
    : OPERATOR.TEXT[0]));

  const updateOperator = (newFieldType) => {
    setOperators(OPERATOR[newFieldType.name]);
    setOperator(OPERATOR[newFieldType.name][0]);
  };

  return [operator, setOperator, operators, updateOperator, fieldType];
}
