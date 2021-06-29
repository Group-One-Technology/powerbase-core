import PropTypes from 'prop-types';
import { IId } from './common';

export const IView = PropTypes.shape({
  id: IId.isRequired,
  name: PropTypes.string.isRequired,
  tableId: IId.isRequired,
  filters: PropTypes.object,
  createdAt: PropTypes.string.isRequired,
  updatedAt: PropTypes.string.isRequired,
});
