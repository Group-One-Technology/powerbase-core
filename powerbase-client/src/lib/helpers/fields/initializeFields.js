/**
 * Adds connections/foreign key info to the fields.
 *
 * @param {array} intialFields the view field array values.
 * @param {array} connections the table connections.
 * @param {object} options configurations.
 * @returns fields
 */
export function initializeFields(intialFields, connections, options = { hidden: true }) {
  const connectionFields = connections?.map((item) => item.columns).flat();
  const fields = options.hidden
    ? intialFields.filter((field) => !field.isHidden)
    : intialFields;

  return fields.map((field) => {
    const connection = connectionFields?.includes(field.name)
      ? connections.find((key) => key.columns.includes(field.name))
      : undefined;

    return ({
      ...field,
      isForeignKey: !!connection,
      isCompositeKey: connection?.columns.length > 1,
      foreignKey: connection
        ? ({
          ...connection,
          columnIndex: connection.columns.indexOf(field.name),
        })
        : undefined,
    });
  });
}
