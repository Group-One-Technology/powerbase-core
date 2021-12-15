export const ErrorType = {
  STATUS: 'Status',
  ACTIVE_RECORD: 'Active Record',
  ELASTICSEARCH: 'Elasticsearch',
};

Object.freeze(ErrorType);

export const BASE_PROGRESS_STEPS = [
  {
    id: 1,
    name: 'Analyzing base',
    value: 'analyzing_base',
    description: 'We\'re currently analyzing the database.',
    disabled: true,
  },
  {
    id: 2,
    name: 'Migrating metadata',
    value: 'migrating_metadata',
    description: 'We\'re currently migrating the metadata of the tables and fields of your base.',
  },
  {
    id: 3,
    name: 'Adding connections',
    value: 'adding_connections',
    description: 'We\'re currently migrating linked records and checking for possible connections.',
  },
  {
    id: 4,
    name: 'Creating listeners',
    value: 'creating_listeners',
    description: 'We\'re currently creating listeners which ensures that the database, tables, field, and records are in synced with your remote database.',
  },
  {
    id: 5,
    name: 'Indexing records',
    value: 'indexing_records',
    description: 'We\'re indexing your records to help you to instantly navigate records in your database.',
  },
  {
    id: 6,
    name: 'Migrated',
    value: 'migrated',
    description: 'We\'re done migrating your database.',
  },
];
