export function formatDate(value, options = {}) {
  if (value == null || value === '') return null;

  const date = typeof value === 'string'
    ? new Date(value)
    : value;

  if (options.dateOnly) {
    const year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
    const month = new Intl.DateTimeFormat('en', { month: 'numeric' }).format(date);
    const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);

    return `${year}-${month}-${day}`;
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZone: 'UTC',
  });
}
