import PropTypes from 'prop-types';

export const IViewField = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  default_value: PropTypes.any.isRequired,
  is_primary_key: PropTypes.bool.isRequired,
  is_nullable: PropTypes.bool.isRequired,
  order: PropTypes.number.isRequired,
  is_frozen: PropTypes.bool.isRequired,
  is_hidden: PropTypes.bool.isRequired,
  view_id: PropTypes.number.isRequired,
  table_id: PropTypes.number.isRequired,
  field_type_id: PropTypes.number.isRequired,
  created_at: PropTypes.string.isRequired,
  updated_at: PropTypes.string.isRequired,
});
