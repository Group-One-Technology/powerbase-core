export const SITE_NAME = 'Powerbase';
export const SITE_DESCRIPTION = 'Powerbase is the missing bridge to the worlds most trusted relational database.';
export const MAX_SMALL_DATABASE_SIZE = 1000000; // 976.56 KB

export const DATABASE_TYPES = [
  { name: 'PostgreSQL', value: 'postgresql' },
  { name: 'MySQL', value: 'mysql2' },
  {
    name: 'SQLite',
    value: 'sqlite',
    description: 'Coming Soon',
    disabled: true,
  },
];

export const DB_PLATFORMS = [
  { name: 'Powerbase Cloud', description: 'A free cloud platform powered by Powerbase.', price: '$0' },
  { name: 'AWS', description: 'Coming Soon', disabled: true },
];

export const POWERBASE_TYPE = [
  { name: 'Powerbase Turbo', description: 'Get a faster experience with the power of Elastic Search. Great for dealing with large datasets.' },
  { name: 'Regular', description: 'A normal experience suited for dealing with small datasets.' },
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

export const SCROLLBAR_WIDTH = 15;
export const ROW_NO_CELL_WIDTH = 80;
export const DEFAULT_CELL_WIDTH = 300;
