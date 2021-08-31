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

export const FieldTypeIcon = React.memo(({ typeId, fieldTypes, className }) => {
  const generatedClassName = cn('text-sm text-gray-600 h-4 w-4', className);
  const fieldType = fieldTypes?.find((item) => item.id === typeId);

  switch (fieldType?.name) {
    case 'Long Text':
      return <MenuAlt1Icon className={generatedClassName} />;
    case 'Checkbox':
      return <CheckCircleIcon className={generatedClassName} />;
    case 'Number ':
      return <HashtagIcon className={generatedClassName} />;
    case 'Single Select':
      return <ChevronDownIcon className={generatedClassName} />;
    case 'Multiple Select':
      return <ChevronDownIcon className={generatedClassName} />;
    case 'Date':
      return <CalendarIcon className={generatedClassName} />;
    case 'Email':
      return <MailIcon className={generatedClassName} />;
    case 'Plugin':
      return <LightningBoltIcon className={generatedClassName} />;
    case 'Others':
      return <TemplateIcon className={generatedClassName} />;
    default:
      return <span className={cn('text-sm font-medium text-gray-600 flex items-center', className)}>A</span>;
  }
});

FieldTypeIcon.propTypes = {
  typeId: PropTypes.number,
  fieldTypes: PropTypes.array,
  className: PropTypes.string,
};
