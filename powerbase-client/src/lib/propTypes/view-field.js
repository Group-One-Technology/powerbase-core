import PropTypes from 'prop-types';
import { IId } from './common';

export const IViewField = PropTypes.shape({
  id: IId.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  defaultValue: PropTypes.any,
  isPrimaryKey: PropTypes.bool.isRequired,
  isNullable: PropTypes.bool.isRequired,
  order: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  isFrozen: PropTypes.bool.isRequired,
  isHidden: PropTypes.bool.isRequired,
  viewId: IId.isRequired,
  tableId: IId.isRequired,
  fieldTypeId: IId.isRequired,
  createdAt: PropTypes.string.isRequired,
  updatedAt: PropTypes.string.isRequired,
});
