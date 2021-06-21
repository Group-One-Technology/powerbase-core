import PropTypes from 'prop-types';
import { IId } from './common';

export const IViewField = PropTypes.shape({
  id: IId.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  default_value: PropTypes.any.isRequired,
  is_primary_key: PropTypes.bool.isRequired,
  is_nullable: PropTypes.bool.isRequired,
  order: PropTypes.number.isRequired,
  is_frozen: PropTypes.bool.isRequired,
  is_hidden: PropTypes.bool.isRequired,
  view_id: IId.isRequired,
  table_id: IId.isRequired,
  field_type_id: IId.isRequired,
  created_at: PropTypes.string.isRequired,
  updated_at: PropTypes.string.isRequired,
});
