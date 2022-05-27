import { LightningBoltIcon, LockClosedIcon, SearchIcon } from '@heroicons/react/outline';

export const MAX_SMALL_DATABASE_SIZE = 1000000; // 976.56 KB

export const BASE_SOURCES = [
  {
    name: 'Fresh Base',
    description: 'Build out your table and data from scratch',
    footnote: 'Options: Postgres, MySQL',
    href: '/base/connect?type=new_base',
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
    href: '/base/connect?type=import_url',
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

export const DatabaseType = {
  POSTGRESQL: 'postgresql',
  MySQL: 'mysql2',
  SQLITE: 'sqlite',
};

export const DATABASE_TYPES = [
  { name: 'PostgreSQL', value: DatabaseType.POSTGRESQL, port: 5432 },
  {
    name: 'MySQL',
    value: DatabaseType.MySQL,
    port: 3306,
    description: 'Coming Soon',
    disabled: true,
  },
  {
    name: 'SQLite',
    value: DatabaseType.SQLITE,
    description: 'Coming Soon',
    disabled: true,
  },
];

export const DB_PLATFORMS = [
  { name: 'Powerbase Cloud', description: 'A free cloud platform powered by Powerbase.', price: '$0' },
  { name: 'AWS', description: 'Coming Soon', disabled: true },
];

export const POWERBASE_TYPE = [
  {
    name: 'Powerbase Turbo',
    description: 'Use Turbo to navigate tens or hundreds of millions of records instantly.',
    features: [
      {
        name: 'Quickly navigate data',
        description: 'With the power of Elasticsearch, navigating millions of data in a snap is made possible.',
        icon: LightningBoltIcon,
      },
      {
        name: 'Full text search',
        description: 'Powerful full-text search capabilities where the speed comes from an inverted index at its core.',
        icon: SearchIcon,
      },
    ],
  },
  {
    name: 'Regular Database',
    description: 'Use your imported or newly created database in navigating records.',
    features: [
      {
        name: 'Data is stored where you want it to be.',
        description: 'Powerbase does not store any data you don\'t give permission to.',
        icon: LockClosedIcon,
      },
    ],
  },
];
