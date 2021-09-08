import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import {
  TemplateIcon,
  CheckCircleIcon,
  HashtagIcon,
  LightningBoltIcon,
  MailIcon,
  MenuAlt1Icon,
  CalendarIcon,
  ChevronDownIcon,
} from '@heroicons/react/solid';
import { FieldType } from '@lib/constants/field-types';

export const FieldTypeIcon = React.memo(({
  typeId,
  fieldType: intialFieldType,
  fieldTypes,
  className,
}) => {
  const generatedClassName = cn('text-sm text-gray-600 h-4 w-4', className);
  const fieldType = intialFieldType || fieldTypes?.find((item) => item.id === typeId);

  switch (fieldType?.name) {
    case FieldType.LONG_TEXT:
      return <MenuAlt1Icon className={generatedClassName} />;
    case FieldType.CHECKBOX:
      return <CheckCircleIcon className={generatedClassName} />;
    case FieldType.NUMBER:
      return <HashtagIcon className={generatedClassName} />;
    case FieldType.SINGLE_SELECT:
      return <ChevronDownIcon className={generatedClassName} />;
    case FieldType.MULTIPLE_SELECT:
      return <ChevronDownIcon className={generatedClassName} />;
    case FieldType.DATE:
      return <CalendarIcon className={generatedClassName} />;
    case FieldType.EMAIL:
      return <MailIcon className={generatedClassName} />;
    case FieldType.PLUGIN:
      return <LightningBoltIcon className={generatedClassName} />;
    case FieldType.OTHERS:
      return <TemplateIcon className={generatedClassName} />;
    default:
      return <span className={cn('text-sm font-medium text-gray-600 flex items-center', className)}>A</span>;
  }
});

FieldTypeIcon.propTypes = {
  typeId: PropTypes.number,
  fieldType: PropTypes.object,
  fieldTypes: PropTypes.array,
  className: PropTypes.string,
};
