import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { KeyIcon as OutlineKeyIcon } from '@heroicons/react/outline';
import {
  TemplateIcon,
  CheckCircleIcon,
  HashtagIcon,
  LightningBoltIcon,
  MailIcon,
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
      return <MailIcon className={generatedClassName} aria-hidden="true" />;
    case FieldType.PLUGIN:
      return <LightningBoltIcon className={generatedClassName} aria-hidden="true" />;
    case FieldType.OTHERS:
      return <TemplateIcon className={generatedClassName} aria-hidden="true" />;
    default:
      return <span className={cn('text-sm w-4 font-medium text-gray-600 flex items-center', className)} aria-hidden="true">A</span>;
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
