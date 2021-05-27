import PropTypes from 'prop-types';

export const IBase = PropTypes.shape({
  id: PropTypes.number.isRequired,
  userId: PropTypes.number.isRequired,
  adapter: PropTypes.oneOf(['postgresql', 'mysql2']).isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  color: PropTypes.oneOf(['gray', 'red', 'yellow', 'green', 'blue', 'indigo', 'purple', 'pink']).isRequired,
  isMigrated: PropTypes.bool.isRequired,
  createdAt: PropTypes.string.isRequired,
  updatedAt: PropTypes.string.isRequired,
  totalTables: PropTypes.number.isRequired,
});
