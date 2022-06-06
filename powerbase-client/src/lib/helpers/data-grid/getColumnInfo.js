import { GridCellKind, GridColumnIcon } from '@glideapps/glide-data-grid';
import { FieldType } from '@lib/constants/field-types';

/**
 * Gets glide data grid cell info for <DataEditor />
 * Used for @glideapps/glide-data-grid
 *
 * Usage:
 * const columns = fields.map((field) => getColumnInfo(field, fieldTypes)
 * ...
 * return <DataEditor columns={columns} ... />
 * */
export function getColumnInfo(field, fieldTypes) {
  const common = {
    id: field.id,
    title: field.alias,
    name: field.name,
    order: field.order,
    width: field.width,
    field,
  };

  if (field.isPrimaryKey) {
    return {
      ...common,
      kind: GridCellKind.RowID,
      icon: GridColumnIcon.HeaderRowID,
    };
  }

  if (field.isForeignKey) {
    return {
      ...common,
      kind: GridCellKind.Bubble,
      icon: GridColumnIcon.HeaderReference,
    };
  }

  const fieldType = fieldTypes?.find((item) => item.id === field.fieldTypeId);

  switch (fieldType?.name) {
    case FieldType.LONG_TEXT:
      return {
        ...common,
        kind: GridCellKind.Text,
        icon: FieldType.LONG_TEXT,
      };
    case FieldType.JSON_TEXT:
      return {
        ...common,
        kind: GridCellKind.Text,
        icon: GridColumnIcon.HeaderCode,
      };
    case FieldType.CHECKBOX:
      return {
        ...common,
        kind: GridCellKind.Boolean,
        icon: GridColumnIcon.HeaderBoolean,
      };
    case FieldType.NUMBER:
      return {
        ...common,
        kind: GridCellKind.Number,
        icon: GridColumnIcon.HeaderNumber,
      };
    case FieldType.SINGLE_SELECT:
      return {
        ...common,
        kind: GridCellKind.Bubble,
        icon: GridColumnIcon.HeaderSingleValue,
      };
    case FieldType.MULTIPLE_SELECT:
      return {
        ...common,
        kind: GridCellKind.Bubble,
        icon: GridColumnIcon.HeaderArray,
      };
    case FieldType.DATE:
      return {
        ...common,
        kind: GridCellKind.Text,
        icon: GridColumnIcon.HeaderDate,
      };
    case FieldType.EMAIL:
      return {
        ...common,
        kind: GridCellKind.Text,
        icon: GridColumnIcon.HeaderEmail,
      };
    case FieldType.URL:
      return {
        ...common,
        kind: GridCellKind.Uri,
        icon: GridColumnIcon.HeaderUri,
      };
    // case FieldType.CURRENCY:
    //   return <CurrencyDollarIcon className={generatedClassName} aria-hidden="true" />;
    // case FieldType.PERCENT:
    //   return (
    //     <svg width="15" height="15" viewBox="0 0 394.4 394.4" aria-hidden="true" className={generatedClassName}>
    //       <path d="M37.4,377.4c-5.223,0-10.438-1.992-14.423-5.977c-7.97-7.963-7.97-20.883,0-28.846l319.6-319.601 c7.97-7.97,20.876-7.97,28.846,0c7.97,7.962,7.97,20.882,0,28.845l-319.6,319.601C47.838,375.408,42.623,377.4,37.4,377.4z M394.4,299.199c0-52.496-42.704-95.199-95.2-95.199S204,246.703,204,299.199s42.704,95.201,95.2,95.201 S394.4,351.695,394.4,299.199z M353.601,299.199c0,29.996-24.405,54.4-54.4,54.4s-54.4-24.404-54.4-54.4 c0-29.994,24.405-54.398,54.4-54.398S353.601,269.205,353.601,299.199z M190.4,95.2C190.4,42.704,147.696,0,95.2,0S0,42.704,0,95.2 s42.704,95.2,95.2,95.2S190.4,147.696,190.4,95.2z M149.6,95.2c0,29.995-24.405,54.4-54.4,54.4s-54.4-24.405-54.4-54.4 s24.405-54.4,54.4-54.4S149.6,65.206,149.6,95.2z" fill="currentColor" />
    //     </svg>
    //   );
    // case FieldType.PLUGIN:
    //   return <LightningBoltIcon className={generatedClassName} aria-hidden="true" />;
    // case FieldType.OTHERS:
    //   return <TemplateIcon className={generatedClassName} aria-hidden="true" />;
    default:
      return {
        ...common,
        kind: GridCellKind.Text,
        icon: GridColumnIcon.HeaderString,
      };
  }
}
