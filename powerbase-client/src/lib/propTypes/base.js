import PropTypes from 'prop-types';

export const COLORS = ['gray', 'red', 'yellow', 'green', 'blue', 'indigo', 'purple', 'pink'];

export const IBase = PropTypes.shape({
  id: PropTypes.number.isRequired,
  userId: PropTypes.number.isRequired,
  adapter: PropTypes.oneOf(['postgresql', 'mysql2']).isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  color: PropTypes.oneOf(COLORS).isRequired,
  isMigrated: PropTypes.bool.isRequired,
  createdAt: PropTypes.string.isRequired,
  updatedAt: PropTypes.string.isRequired,
  totalTables: PropTypes.number.isRequired,
});

export const IBaseSource = PropTypes.shape({
  pretext: PropTypes.string,
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  footnote: PropTypes.string,
});
