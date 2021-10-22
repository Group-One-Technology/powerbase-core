export function initializeFields(fields, connections) {
  const connectionFields = connections?.map((item) => item.columns).flat();

  return fields.filter((field) => !field.isHidden)
    .map((field) => {
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
