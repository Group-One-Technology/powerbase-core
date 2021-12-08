export const MAX_SMALL_DATABASE_SIZE = 1000000; // 976.56 KB

export const BASE_SOURCES = [
  {
    name: 'Fresh Base',
    description: 'Build out your table and data from scratch',
    footnote: 'Options: Postgres, MySQL',
    href: '/base/create',
  },
  {
    pretext: 'Connect Existing',
    name: 'Postgres',
    footnote: 'Connect to your existing postgres database',
    href: '/base/connect?adapter=postgresql',
  },
  {
    pretext: 'Connect Existing',
    name: 'MySQL',
    footnote: 'Connect to your existing mysql database',
    href: '/base/connect?adapter=mysql2',
  },
  {
    pretext: 'Import Existing',
    name: 'SQL Database from URL',
    footnote: 'Connect your existing mysql or postgres database',
    href: '/base/connect-url',
  },
  {
    name: 'Hubspot',
    description: 'Connect your Hubspot account',
    footnote: 'Campaigns, Companies, Contacts, Contact Lists, Deals, Deal Pipelines, Email Events, +3 More',
    href: '/base/integration/connect?type=hubspot',
  },
  {
    name: 'Shopify',
    description: 'Connect your Shopify account',
    footnote: 'Customers, Orders, Products, Abandoned Checkouts',
    href: '/base/integration/connect?type=shopify',
  },
];

export const DATABASE_TYPES = [
  { name: 'PostgreSQL', value: 'postgresql', port: 5432 },
  { name: 'MySQL', value: 'mysql2', port: 3306 },
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
