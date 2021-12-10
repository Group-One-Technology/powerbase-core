export const ErrorType = {
  STATUS: 'Status',
  ACTIVE_RECORD: 'Active Record',
  ELASTICSEARCH: 'Elasticsearch',
};

Object.freeze(ErrorType);

export const BASE_PROGRESS_STEPS = [
  { name: 'Analyzing base', status: 'complete' },
  { name: 'Migrating metadata', status: 'complete' },
  { name: 'Adding connections', status: 'current' },
  { name: 'Creating listeners', status: 'upcoming' },
  { name: 'Indexing records', status: 'upcoming' },
];
