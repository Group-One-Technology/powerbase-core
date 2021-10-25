import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import {
  AtSymbolIcon,
  CodeIcon,
  CurrencyDollarIcon,
  KeyIcon as OutlineKeyIcon,
  LinkIcon,
} from '@heroicons/react/outline';
import {
  TemplateIcon,
  CheckCircleIcon,
  HashtagIcon,
  LightningBoltIcon,
  MenuAlt1Icon,
  KeyIcon,
  CalendarIcon,
  ChevronDownIcon,
} from '@heroicons/react/solid';
import { FieldType } from '@lib/constants/field-types';

export const FieldTypeIcon = React.memo(({
  typeId,
  isPrimaryKey,
  isForeignKey,
  fieldType: intialFieldType,
  fieldTypes,
  className,
}) => {
  const generatedClassName = cn('text-sm text-gray-600 h-4 w-4', className);
  const fieldType = intialFieldType || fieldTypes?.find((item) => item.id === typeId);

  if (isPrimaryKey) {
    return <KeyIcon className={generatedClassName} aria-hidden="true" />;
  }

  if (isForeignKey) {
    return <OutlineKeyIcon className={generatedClassName} aria-hidden="true" />;
  }

  switch (fieldType?.name) {
    case FieldType.LONG_TEXT:
      return <MenuAlt1Icon className={generatedClassName} aria-hidden="true" />;
    case FieldType.JSON_TEXT:
      return <CodeIcon className={generatedClassName} aria-hidden="true" />;
    case FieldType.CHECKBOX:
      return <CheckCircleIcon className={generatedClassName} aria-hidden="true" />;
    case FieldType.NUMBER:
      return <HashtagIcon className={generatedClassName} aria-hidden="true" />;
    case FieldType.SINGLE_SELECT:
      return <ChevronDownIcon className={generatedClassName} aria-hidden="true" />;
    case FieldType.MULTIPLE_SELECT:
      return <ChevronDownIcon className={generatedClassName} aria-hidden="true" />;
    case FieldType.DATE:
      return <CalendarIcon className={generatedClassName} aria-hidden="true" />;
    case FieldType.EMAIL:
      return <AtSymbolIcon className={generatedClassName} aria-hidden="true" />;
    case FieldType.URL:
      return <LinkIcon className={generatedClassName} aria-hidden="true" />;
    case FieldType.CURRENCY:
      return <CurrencyDollarIcon className={generatedClassName} aria-hidden="true" />;
    case FieldType.PERCENT:
      return (
        <svg width="15" height="15" viewBox="0 0 394.4 394.4" aria-hidden="true" className={generatedClassName}>
          <path d="M37.4,377.4c-5.223,0-10.438-1.992-14.423-5.977c-7.97-7.963-7.97-20.883,0-28.846l319.6-319.601 c7.97-7.97,20.876-7.97,28.846,0c7.97,7.962,7.97,20.882,0,28.845l-319.6,319.601C47.838,375.408,42.623,377.4,37.4,377.4z M394.4,299.199c0-52.496-42.704-95.199-95.2-95.199S204,246.703,204,299.199s42.704,95.201,95.2,95.201 S394.4,351.695,394.4,299.199z M353.601,299.199c0,29.996-24.405,54.4-54.4,54.4s-54.4-24.404-54.4-54.4 c0-29.994,24.405-54.398,54.4-54.398S353.601,269.205,353.601,299.199z M190.4,95.2C190.4,42.704,147.696,0,95.2,0S0,42.704,0,95.2 s42.704,95.2,95.2,95.2S190.4,147.696,190.4,95.2z M149.6,95.2c0,29.995-24.405,54.4-54.4,54.4s-54.4-24.405-54.4-54.4 s24.405-54.4,54.4-54.4S149.6,65.206,149.6,95.2z" fill="currentColor" />
        </svg>
      );
    case FieldType.PLUGIN:
      return <LightningBoltIcon className={generatedClassName} aria-hidden="true" />;
    case FieldType.OTHERS:
      return <TemplateIcon className={generatedClassName} aria-hidden="true" />;
    default:
      return (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true" className={generatedClassName}>
          <path d="M3.94993 2.95002L3.94993 4.49998C3.94993 4.74851 3.74845 4.94998 3.49993 4.94998C3.2514 4.94998 3.04993 4.74851 3.04993 4.49998V2.50004C3.04993 2.45246 3.05731 2.40661 3.07099 2.36357C3.12878 2.18175 3.29897 2.05002 3.49993 2.05002H11.4999C11.6553 2.05002 11.7922 2.12872 11.8731 2.24842C11.9216 2.32024 11.9499 2.40682 11.9499 2.50002L11.9499 2.50004V4.49998C11.9499 4.74851 11.7485 4.94998 11.4999 4.94998C11.2514 4.94998 11.0499 4.74851 11.0499 4.49998V2.95002H8.04993V12.05H9.25428C9.50281 12.05 9.70428 12.2515 9.70428 12.5C9.70428 12.7486 9.50281 12.95 9.25428 12.95H5.75428C5.50575 12.95 5.30428 12.7486 5.30428 12.5C5.30428 12.2515 5.50575 12.05 5.75428 12.05H6.94993V2.95002H3.94993Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
        </svg>
      );
  }
});

FieldTypeIcon.propTypes = {
  typeId: PropTypes.number,
  fieldType: PropTypes.object,
  fieldTypes: PropTypes.array,
  isPrimaryKey: PropTypes.bool,
  isForeignKey: PropTypes.bool,
  className: PropTypes.string,
};
