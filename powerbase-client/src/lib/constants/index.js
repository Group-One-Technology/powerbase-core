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

export const CURRENCY_OPTIONS = [
  { name: 'US Dollar', code: 'USD' },
  { name: 'Euro', code: 'EUR' },
  { name: 'Australian Dollar', code: 'AUD' },
  { name: 'Indian Rupee', code: 'INR' },
  { name: 'Norwegian Krone', code: 'NOK' },
  { name: 'Brazilian Real', code: 'BRL' },
  { name: 'Riel', code: 'KHR' },
  { name: 'Canadian Dollar', code: 'CAD' },
  { name: 'Colombian Peso', code: 'COP' },
  { name: 'New Zealand Dollar', code: 'NZD' },
  { name: 'Danish Krone', code: 'DKK' },
  { name: 'Egyptian Pound', code: 'EGP' },
  { name: 'Lari', code: 'GEL' },
  { name: 'Hong Kong Dollar', code: 'HKD' },
  { name: 'Rupiah', code: 'IDR' },
  { name: 'Yen', code: 'JPY' },
  { name: 'Pound Sterling', code: 'GBP' },
  { name: 'Won', code: 'KRW' },
  { name: 'Mexican Peso', code: 'MXN' },
  { name: 'Pakistan Rupee', code: 'PKR' },
  { name: 'Philippine Peso', code: 'PHP' },
  { name: 'Baht', code: 'THB' },
];
