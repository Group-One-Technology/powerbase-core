export const ErrorType = {
  STATUS: 'Status',
  ACTIVE_RECORD: 'Active Record',
  ELASTICSEARCH: 'Elasticsearch',
};

Object.freeze(ErrorType);

export const BASE_PROGRESS_STEPS = [
  {
    id: 1, name: 'Analyzing base', value: 'analyzing_base', disabled: true,
  },
  { id: 2, name: 'Migrating metadata', value: 'migrating_metadata' },
  { id: 3, name: 'Adding connections', value: 'adding_connections' },
  { id: 4, name: 'Creating listeners', value: 'creating_listeners' },
  { id: 5, name: 'Indexing records', value: 'indexing_records' },
];
