export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const SITE_NAME = 'Powerbase';
export const SITE_DESCRIPTION = 'Powerbase is the missing bridge to the worlds most trusted relational database.';
export const SUPPORT_EMAIL = 'team@trypowerbase.com';

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

export const OUTLINE_COLORS = {
  gray: 'text-gray-500',
  yellow: 'text-yellow-500',
  red: 'text-red-500',
  green: 'text-green-500',
  blue: 'text-blue-500',
  indigo: 'text-indigo-500',
  purple: 'text-purple-500',
  pink: 'text-pink-500',
};

export const SCROLLBAR_WIDTH = 15;
export const ROW_NO_CELL_WIDTH = 80;
export const DEFAULT_CELL_WIDTH = 150;

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

export const MOCK_PEOPLE = [
  {
    name: 'Leonard Krasner',
    email: 'leonardkrasner@gmail.com',
    imageUrl:
      'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Floyd Miles',
    email: 'floydmiles@gmail.com',
    imageUrl:
      'https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Emily Selman',
    email: 'emilyselman@gmail.com',
    imageUrl:
      'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Kristin Watson',
    email: 'kristinwatson@gmail.com',
    imageUrl:
      'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
];

export const NUMBER_FORMAT_OPTIONS = [
  { id: 1, name: 'Integer' },
  { id: 2, name: 'Decimal' },
];

export const PRECISION_POINTS = [
  { id: 1, name: '1', precision: 0 },
  { id: 2, name: '1.0', precision: 1 },
  { id: 3, name: '1.00', precision: 2 },
  { id: 4, name: '1.000', precision: 3 },
  { id: 5, name: '1.0000', precision: 4 },
];
