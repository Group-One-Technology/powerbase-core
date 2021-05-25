/* eslint-disable object-curly-newline */
export const SITE_NAME = 'Powerbase';
export const SITE_DESCRIPTION = 'Powerbase is the missing bridge to the worlds most trusted relational database.';

export const DATABASE_TYPES = [
  { name: 'PostgreSQL', value: 'postgresql' },
  { name: 'MySQL', value: 'mysql2', description: 'Coming Soon', disabled: true },
  { name: 'SQLite', value: 'sqlite', description: 'Coming Soon', disabled: true },
];

export const DB_PLATFORMS = [
  { name: 'Powerbase Cloud', description: 'A free cloud platform great for hobby and MVP apps.', price: '$0' },
  { name: 'AWS', description: 'Coming Soon', disabled: true },
];

export const BG_COLORS = {
  gray: 'bg-gray-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  indigo: 'bg-indigo-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
};
