import { UserGroupIcon, UserIcon } from '@heroicons/react/outline';

export const VIEWS_PERMISSIONS = [
  {
    name: 'Collaborative View',
    description: 'Editors and up can edit this view.',
    value: 'collaborative',
    icon: UserGroupIcon,
  },
  {
    name: 'Personal View',
    description: 'Only you and the owner can edit this view.',
    value: 'personal',
    icon: UserIcon,
  },
];

export const VIEW_TYPES = [
  {
    name: 'Grid',
    value: 'grid',
    description: 'A table view wherein data is structured in rows and columns which you can store, sort and filter data. Great for viewing all types of data.',
  },
  {
    name: 'Kanban',
    value: 'kanban',
    description: 'A kanban board, grouped by select field, which you can use for project planning, etc.',
    disabled: true,
  },
  {
    name: 'Calendar',
    value: 'calendar',
    description: 'A monthly view of your records, sorted by a date field, which you can use for event planning, etc.',
    disabled: true,
  },
];
