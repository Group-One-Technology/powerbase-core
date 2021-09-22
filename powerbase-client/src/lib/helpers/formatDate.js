export function formatDate(value) {
  if (value == null || value === '') return null;

  const date = typeof value === 'string'
    ? new Date(value)
    : value;

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  });
}
