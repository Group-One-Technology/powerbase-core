import { isValidNumberOrDecimal, isValidInteger, formatToDecimalPlaces } from '@lib/helpers/numbers';
import { getParameterCaseInsensitive } from '@lib/helpers/getParameterCaseInsensitive';
import { addOrUpdateMagicValue } from '@lib/api/records';

export function useEditingCell(
  field, fieldType, setEditCellInput, setCellToEdit, setUpdatedRecords, setIsEditing, recordInputRef, editCellInput,
  rowIndex, initialFields, initializeFields, connections, records, isTurbo, updatedRecords, setIsNewRecord,
) {
  const handleMagicInputValidation = (val) => {
    if (!val) return true;
    const type = fieldType.dataType;
    switch (type?.toLowerCase()) {
      case 'string':
      case 'text':
        return true;
      case 'number':
        return field.options.precision
          ? isValidNumberOrDecimal(val)
          : isValidInteger(val);
      default:
        return true;
    }
  };

  const onChange = (e) => {
    const magicInputValue = e.target.value;
    if (!handleMagicInputValidation(magicInputValue)) return;
    setEditCellInput(magicInputValue);
  };

  const onClickOutsideEditingCell = async (e, calendarData = null) => {
    const exitEditing = () => {
      setCellToEdit({});
      recordInputRef?.current?.blur();
      setIsEditing(false);
    };

    if (!editCellInput?.length && fieldType.dataType !== 'date') {
      exitEditing();
      return;
    }
    const rowNo = rowIndex + 1;
    const updatedFields = initializeFields(initialFields, connections, {
      hidden: false,
    })
      .map((item) => ({
        ...item,
        value: records[rowNo - 1][item.name],
      }))
      .sort((x, y) => x.order > y.order);

    const computedFields = updatedFields.filter(
      (item) => !(item.isHidden || item.foreignKey?.columns.length > 1),
    );

    const primaryKeys = computedFields?.filter((item) => item.isPrimaryKey);

    /* The ids are composed in a double underscore and double hypen commas to avoid
    incomplete splits down the line for field names that have underscore already */
    // ! TODO - REFACTOR to use a new identifier-composition approach with unique unicode characters
    const composedKeys = primaryKeys
      .map((primaryKey) => {
        const keyName = primaryKey.name.toLowerCase();
        const keyValue = (`${primaryKey.value}`).toLocaleLowerCase();
        return `${keyName}${isTurbo ? '_' : '___'}${keyValue}`;
      })
      .join(isTurbo ? '-' : '---');

    let hasPrecision = false;
    let formattedNumber;
    if (field.options.precision && fieldType.dataType === 'number') {
      hasPrecision = true;
      const sanitizedNumber = parseFloat(recordInputRef.current?.value);
      formattedNumber = formatToDecimalPlaces(sanitizedNumber, field.options.precision);
    }

    try {
      const { data } = await addOrUpdateMagicValue({
        tableId: field.tableId,
        primary_keys: composedKeys,
        data: {
          [field.name]: field.options.precision
            ? formattedNumber
            : recordInputRef.current?.value,
        },
      });

      const recordsToUse = updatedRecords || records;
      if (data) {
        const mutatedRecords = recordsToUse?.map((recordObj) => {
          const matches = [];
          const extractedPrimaryKeys = isTurbo
            ? primaryKeys
            : composedKeys.split('---');
          let objToUse = {};
          extractedPrimaryKeys.forEach((extractedKey, pkIdx) => {
            let sanitized;
            if (!isTurbo) sanitized = extractedKey.split('___');
            const pkName = isTurbo ? extractedKey.name : sanitized[0];
            const pkValue = isTurbo ? extractedKey.value : sanitized[1];
            matches.push(
              `${getParameterCaseInsensitive(recordObj, pkName)}`
                === `${pkValue}`,
            );
            if (pkIdx === extractedPrimaryKeys.length - 1) {
              if (!matches.includes(false)) {
                const newObj = { ...recordObj };
                newObj[field.name] = hasPrecision && formattedNumber
                  ? formattedNumber
                  : calendarData || recordInputRef.current?.value;
                objToUse = newObj;
              } else {
                objToUse = recordObj;
              }
            }
          });
          return objToUse;
        });
        setUpdatedRecords(mutatedRecords);
        setIsNewRecord(false);
        exitEditing();
      }
    } catch (error) {
      exitEditing();
      console.log(error);
    }
  };

  return { onChange, onClickOutsideEditingCell };
}
